// erp-country.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CrudButton } from '../../../shared/components/crud-button/crud-button';
import { LimitInputDirective } from '../../../shared/directive/limit-input';

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

  // Status options
  statusOptions = [
    { value: true, label: 'Active' },
    { value: false, label: 'Inactive' }
  ];

  constructor(
    private _fb: FormBuilder,
    private _activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.initForm();
    this._activatedRoute.queryParams.subscribe(params => {
      this.formId = params['f'] || '';
      this.headerTitle = params['formTitle'] || 'Country Setup';
      this.rowId = params['id'] || '';

      if (this.rowId) {
        this.isEditMode = true;
        this.loadForEdit(this.rowId);
      }
    });
  }

  initForm(): void {
    this.countryForm = this._fb.group({
      countryId: [''],
      countryName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      countryCode: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(10)]],
      isActive: [true, Validators.required],
    });
  }

  loadForEdit(rowId: string): void {
    // Load country data for edit
    // This will be implemented when API is ready
    // Example:
    // this.countryService.getCountry(rowId).subscribe({
    //   next: (res) => {
    //     if (res.isSuccess) {
    //       this.countryForm.patchValue(res.data);
    //     }
    //   }
    // });
  }

  onSave(): void {
    this.submitted = true;
    if (this.countryForm.invalid) {
      Object.keys(this.countryForm.controls).forEach(key => {
        const control = this.countryForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    console.log('Form submitted:', this.countryForm.value);
    // API call will go here
  }

  onUpdate(): void {
    this.submitted = true;
    if (this.countryForm.invalid) {
      Object.keys(this.countryForm.controls).forEach(key => {
        const control = this.countryForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    console.log('Form updated:', this.countryForm.value);
    // API call will go here
  }

  onAuthorize(): void {
    console.log('Authorize clicked');
  }

  onReject(): void {
    console.log('Reject clicked');
  }

  onReset(): void {
    this.submitted = false;
    this.countryForm.reset();
    this.countryForm.patchValue({
      isActive: true
    });
    Object.keys(this.countryForm.controls).forEach(key => {
      const control = this.countryForm.get(key);
      control?.markAsPristine();
      control?.markAsUntouched();
    });
  }

  onViewChangeHistory(): void {
    console.log('View change history');
  }

  onBack(): void {
    window.history.back();
  }

  // Helper methods
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