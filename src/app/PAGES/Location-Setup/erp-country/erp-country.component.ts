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

  statusOptions = [
    { value: true, label: 'Active' },
    { value: false, label: 'Inactive' }
  ];

  constructor(
    private _fb: FormBuilder,
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private dialog: DialogService,
    private gridService: GridService // ✅ Inject Generic Service
  ) { }

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
    const id = parseInt(rowId, 10);
    this.gridService.getRecordById(this.formId, id)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data) => {
          this.countryForm.patchValue(data);
        },
        error: (err: any) => {
          console.error('Error loading record for edit:', err);
          this.dialog.alertBox('Failed to load record details.');
        }
      });
  }

  onSave(): void {
    this.submitted = true;
    if (this.countryForm.invalid) {
      this.markAllFieldsTouched();
      return;
    }

    const payload = {
      formId: this.formId,
      data: this.countryForm.value
    };

    // ✅ Use Generic Service: insertRecord(formName, data)
    this.gridService.insertRecord(this.formId, payload).subscribe({
      next: (response) => {
        const apiMessage = response?.message || 'Record saved successfully!';
        this.dialog.alertBox(apiMessage).then(() => {
          this.onReset();
        });
      },
      error: (err) => {
        this.dialog.alertBox(err?.error?.message || 'An error occurred while saving.');
      }
    });
  }

  onUpdate(): void {
    this.submitted = true;
    if (this.countryForm.invalid) {
      this.markAllFieldsTouched();
      return;
    }

    const payload = {
      formId: this.formId,
      data: this.countryForm.value,
      recordId: this.rowId
    };

    // ✅ Use Generic Service: updateRecord(formName, data)
    this.gridService.updateRecord(this.formId, payload).subscribe({
      next: (response) => {
        const apiMessage = response?.message || 'Record updated successfully!';
        this.dialog.alertBox(apiMessage).then(() => {
          this.isEditMode = false;
        });
      },
      error: (err) => {
        this.dialog.alertBox(err?.error?.message || 'An error occurred while updating.');
      }
    });
  }

  onReset(): void {
    this.submitted = false;
    this.countryForm.reset();
    this.countryForm.patchValue({
      countryId: 0,
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

  isFieldInvalid(fieldName: string): boolean {
    const control = this.countryForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched || this.submitted));
  }

  getFieldError(fieldName: string): string {
    const control = this.countryForm.get(fieldName);
    if (!control || !control.errors) return '';

    const errors = control.errors;
    if (errors['required']) return 'This field is required';
    if (errors['minlength']) return `Minimum length is ${errors['minlength'].requiredLength} characters`;
    if (errors['maxlength']) return `Maximum length is ${errors['maxlength'].requiredLength} characters`;
    if (errors['pattern']) return 'Invalid format';

    return 'Invalid value';
  }
}