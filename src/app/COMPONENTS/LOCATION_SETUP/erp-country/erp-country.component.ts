import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CrudButton } from '../../../shared/components/crud-button/crud-button';
import { LimitInputDirective } from '../../../shared/directive/limit-input';
import { finalize } from 'rxjs';
import { DialogService } from '../../../core/services/DialogService';
import { GridService } from '../../../core/services/grid.service';

@Component({
  selector: 'app-erp-country',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CrudButton,
    RouterModule,
    LimitInputDirective,
  ],
  templateUrl: './erp-country.component.html',
})
export class ErpCountryComponent implements OnInit {
  countryForm!: FormGroup;
  submitted: boolean = false;
  formId: string = '';
  headerTitle: string = 'Country Setup';
  rowId: string = '';
  isEditMode: boolean = false;
  isLoading: boolean = false;

  // ✅ Track backend validation errors
  fieldErrors: { [key: string]: string[] } = {};

  statusOptions = [
    { value: true, label: 'Active' },
    { value: false, label: 'Inactive' }
  ];

  constructor(
    private _fb: FormBuilder,
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private dialog: DialogService,
    private gridService: GridService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this._activatedRoute.queryParams.subscribe(params => {
      this.formId = params['f'] || 'Country';
      this.headerTitle = params['formTitle'] || 'Country Setup';
      this.rowId = params['id'] || '';

      if (this.rowId) {
        this.isEditMode = true;
        this.loadForEdit(this.rowId);
      } else {
        this.isEditMode = false;
        this.onReset();
      }
    });
  }

  initForm(): void {
    this.countryForm = this._fb.group({
      countryId: [0],
      countryName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      countryCode: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(10)]],
      isActive: [true, Validators.required],
    });
  }

 loadForEdit(rowId: string): void {
  this.isLoading = true;
  this.gridService.getRecordById(this.formId, rowId)
    .pipe(finalize(() => this.isLoading = false))
    .subscribe({
      next: (data) => {
        const mappedData = {
          countryId: data['CountryId'] || data['countryId'] || 0,
          countryName: data['CountryName'] || data['countryName'] || '',
          countryCode: data['CountryCode'] || data['countryCode'] || '',
          isActive: data['IsActive'] ?? data['isActive'] ?? true
        };
        
        this.countryForm.patchValue(mappedData);
      },
      error: (err: any) => {
        console.error('Error loading record for edit:', err);
        this.dialog.alertBox('Failed to load record details.');
      }
    });
}

  // ✅ CLEAR FIELD ERRORS when user types
  onFieldChange(fieldName: string): void {
    const control = this.countryForm.get(fieldName);
    const currentValue = control?.value;

    if (currentValue && currentValue.toString().trim() !== '') {
      if (this.fieldErrors[fieldName]) {
        delete this.fieldErrors[fieldName];
      }
    }
  }

  // ✅ FRONTEND + BACKEND VALIDATION
  onSave(): void {
    this.submitted = true;
    this.fieldErrors = {}; // Clear previous backend errors

    if (this.countryForm.invalid) {
      this.markAllFieldsTouched();
      return;
    }

    const payload = {
      formId: this.formId,
      data: {
        countryName: this.countryForm.value.countryName,
        countryCode: this.countryForm.value.countryCode,
        isActive: this.countryForm.value.isActive
      }
    };

    this.gridService.insertRecord(this.formId, payload).subscribe({
      next: (response) => {
        const apiMessage = response?.message || 'Record saved successfully!';
        this.dialog.alertBox(apiMessage).then(() => {
          this.onReset();
        });
      },
      error: (err) => {
        // ✅ Handle Backend 400 Validation Errors
        if (err.status === 400 && err.error?.errors) {
          this.fieldErrors = err.error.errors;
          
          // Mark fields with backend errors as touched
          Object.keys(this.fieldErrors).forEach(key => {
            const control = this.countryForm.get(key);
            if (control) {
              control.markAsTouched();
            }
          });
        } else {
          this.dialog.alertBox(err?.error?.message || 'An error occurred while saving.');
        }
      }
    });
  }

  // ✅ FRONTEND + BACKEND VALIDATION
  onUpdate(): void {
    this.submitted = true;
    this.fieldErrors = {}; // Clear previous backend errors

    if (this.countryForm.invalid) {
      this.markAllFieldsTouched();
      return;
    }

    const payload = {
      formId: this.formId,
      data: {
        countryName: this.countryForm.value.countryName,
        countryCode: this.countryForm.value.countryCode,
        isActive: this.countryForm.value.isActive
      },
      recordId: this.rowId
    };

    this.gridService.updateRecord(this.formId, payload).subscribe({
      next: (response) => {
        const apiMessage = response?.message || 'Record updated successfully!';
        this.dialog.alertBox(apiMessage).then(() => {
          this.isEditMode = false;
        });
      },
      error: (err) => {
        // ✅ Handle Backend 400 Validation Errors
        if (err.status === 400 && err.error?.errors) {
          this.fieldErrors = err.error.errors;
          
          Object.keys(this.fieldErrors).forEach(key => {
            const control = this.countryForm.get(key);
            if (control) {
              control.markAsTouched();
            }
          });
        } else {
          this.dialog.alertBox(err?.error?.message || 'An error occurred while updating.');
        }
      }
    });
  }

  onReset(): void {
    this.submitted = false;
    this.fieldErrors = {};
    this.countryForm.reset();
    this.countryForm.patchValue({
      countryId: 0,
      isActive: true
    });
    this.isEditMode = false;
    this.markAllFieldsPristine();
  }

  onBack(): void {
  // Navigate back to the Grid List
  this._router.navigate([`/app/ErpList/${this.formId}`], {
    queryParams: { formTitle: this.headerTitle }
  });
}
  // ─── HELPERS ─────────────────────────────────────────────────────────

  // Check if field has frontend OR backend validation error
  isFieldInvalid(fieldName: string): boolean {
    const control = this.countryForm.get(fieldName);
    const hasFrontendError = !!(control && control.invalid && (control.dirty || control.touched || this.submitted));
    const hasBackendError = this.hasFieldError(fieldName);
    return hasFrontendError || hasBackendError;
  }

  // Get error message (frontend priority, fallback to backend)
  getFieldError(fieldName: string): string {
    const control = this.countryForm.get(fieldName);

    // 1. Check backend errors first
    if (this.hasFieldError(fieldName)) {
      return this.getFieldErrors(fieldName)[0];
    }

    // 2. Check frontend errors
    if (!control || !control.errors) return '';
    const errors = control.errors;
    if (errors['required']) return 'This field is required';
    if (errors['minlength']) return `Minimum length is ${errors['minlength'].requiredLength} characters`;
    if (errors['maxlength']) return `Maximum length is ${errors['maxlength'].requiredLength} characters`;
    if (errors['pattern']) return 'Invalid format';

    return 'Invalid value';
  }

  // Backend error helpers
  hasFieldError(fieldName: string): boolean {
    return this.fieldErrors[fieldName] && this.fieldErrors[fieldName].length > 0;
  }

  getFieldErrors(fieldName: string): string[] {
    return this.fieldErrors[fieldName] || [];
  }

  private markAllFieldsTouched(): void {
    Object.keys(this.countryForm.controls).forEach(key => {
      const control = this.countryForm.get(key);
      control?.markAsTouched();
    });
  }

  private markAllFieldsPristine(): void {
    Object.keys(this.countryForm.controls).forEach(key => {
      const control = this.countryForm.get(key);
      control?.markAsPristine();
      control?.markAsUntouched();
    });
  }

  get f() { return this.countryForm.controls; }
}