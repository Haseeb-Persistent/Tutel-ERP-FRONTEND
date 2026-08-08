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
  selector: 'app-erp-province',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CrudButton,
    RouterModule,
    LimitInputDirective,
  ],
  templateUrl: './erp-province.component.html',
})
export class ErpProvinceComponent implements OnInit {
  provinceForm!: FormGroup;
  submitted: boolean = false;
  formId: string = '';
  headerTitle: string = 'Province Setup';
  rowId: string = '';
  isEditMode: boolean = false;
  isLoading: boolean = false;

  // Track backend validation errors
  fieldErrors: { [key: string]: string[] } = {};

  // ✅ ADD THIS: To store the list of countries
  countryList: any[] = [];

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
    this.loadCountries();
    this._activatedRoute.queryParams.subscribe(params => {
      this.formId = params['f'] || 'Province';
      this.headerTitle = params['formTitle'] || 'Province Setup';
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
    this.provinceForm = this._fb.group({
      provinceId: [0],
      countryId: ['', Validators.required], // Changed to empty string
      provinceName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      isActive: [true, Validators.required],
    });
  }

  // ✅ Fetch all countries for the dropdown
  loadCountries() {
    this.gridService.getGridData('Country').subscribe({
      next: (res: any) => {
        if (Array.isArray(res)) {
          this.countryList = res;
        }
      },
      error: (err) => {
        console.error('Error loading countries:', err);
      }
    });
  }

  loadForEdit(rowId: string): void {
    this.isLoading = true;
    this.gridService.GettAllOptions(this.formId, rowId)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data) => {
          if (data) {
            this.provinceForm.patchValue(data);
          } else {
          }
        },
        error: (err: any) => {
          console.error('Error loading record for edit:', err);
          this.dialog.alertBox('Failed to load record details.');
        }
      });
  }

  onFieldChange(fieldName: string): void {
    const control = this.provinceForm.get(fieldName);
    const currentValue = control?.value;

    if (currentValue && currentValue.toString().trim() !== '') {
      if (this.fieldErrors[fieldName]) {
        delete this.fieldErrors[fieldName];
      }
    }
  }

  onSave(): void {
    this.submitted = true;
    this.fieldErrors = {};

    if (this.provinceForm.invalid) {
      this.markAllFieldsTouched();
      return;
    }

    const payload = {
      formId: this.formId,
      data: {
        countryId: this.provinceForm.value.countryId,
        provinceName: this.provinceForm.value.provinceName,
        isActive: this.provinceForm.value.isActive
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
        if (err.status === 400 && err.error?.errors) {
          this.fieldErrors = err.error.errors;
          Object.keys(this.fieldErrors).forEach(key => {
            const control = this.provinceForm.get(key);
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

  onUpdate(): void {
    this.submitted = true;
    this.fieldErrors = {};

    if (this.provinceForm.invalid) {
      this.markAllFieldsTouched();
      return;
    }

    const payload = {
      formId: this.formId,
      data: {
        countryId: this.provinceForm.value.countryId,
        provinceName: this.provinceForm.value.provinceName,
        isActive: this.provinceForm.value.isActive
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
        if (err.status === 400 && err.error?.errors) {
          this.fieldErrors = err.error.errors;
          Object.keys(this.fieldErrors).forEach(key => {
            const control = this.provinceForm.get(key);
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
    this.provinceForm.reset();
    this.provinceForm.patchValue({
      provinceId: 0,
      isActive: true
    });
    this.isEditMode = false;
    this.markAllFieldsPristine();
  }

  onBack(): void {
    this._router.navigate([`/app/ErpList/${this.formId}`], {
      queryParams: { formTitle: this.headerTitle }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.provinceForm.get(fieldName);
    const hasFrontendError = !!(control && control.invalid && (control.dirty || control.touched || this.submitted));
    const hasBackendError = this.hasFieldError(fieldName);
    return hasFrontendError || hasBackendError;
  }

  getFieldError(fieldName: string): string {
    const control = this.provinceForm.get(fieldName);

    if (this.hasFieldError(fieldName)) {
      return this.getFieldErrors(fieldName)[0];
    }

    if (!control || !control.errors) return '';
    const errors = control.errors;
    if (errors['required']) return 'This field is required';
    if (errors['minlength']) return `Minimum length is ${errors['minlength'].requiredLength} characters`;
    if (errors['maxlength']) return `Maximum length is ${errors['maxlength'].requiredLength} characters`;
    if (errors['pattern']) return 'Invalid format';

    return 'Invalid value';
  }

  hasFieldError(fieldName: string): boolean {
    return this.fieldErrors[fieldName] && this.fieldErrors[fieldName].length > 0;
  }

  getFieldErrors(fieldName: string): string[] {
    return this.fieldErrors[fieldName] || [];
  }

  private markAllFieldsTouched(): void {
    Object.keys(this.provinceForm.controls).forEach(key => {
      const control = this.provinceForm.get(key);
      control?.markAsTouched();
    });
  }

  private markAllFieldsPristine(): void {
    Object.keys(this.provinceForm.controls).forEach(key => {
      const control = this.provinceForm.get(key);
      control?.markAsPristine();
      control?.markAsUntouched();
    });
  }

  get f() { return this.provinceForm.controls; }
}