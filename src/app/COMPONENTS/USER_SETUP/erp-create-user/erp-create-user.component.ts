// erp-create-user.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CrudButton } from "../../../shared/components/crud-button/crud-button";

@Component({
  selector: 'app-erp-create-user',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CrudButton
],
  templateUrl: './erp-create-user.component.html',
  styleUrls: ['./erp-create-user.component.css']
})
export class ErpCreateUserComponent implements OnInit {
  userForm!: FormGroup;
  submitted: boolean = false;
  formId: string = '';
  headerTitle: string = '';
  rowId: string = '';

  // Dropdown options
  genderOptions = [
    { value: 'M', label: 'Male' },
    { value: 'F', label: 'Female' },
    { value: 'O', label: 'Other' }
  ];

  maritalStatusOptions = [
    { value: 'S', label: 'Single' },
    { value: 'M', label: 'Married' },
    { value: 'D', label: 'Divorced' },
    { value: 'W', label: 'Widowed' }
  ];

  nationalityOptions = [
    { value: 'PK', label: 'Pakistani' },
    { value: 'US', label: 'American' },
    { value: 'UK', label: 'British' },
    { value: 'IN', label: 'Indian' }
  ];

  religionOptions = [
    { value: 'ISLAM', label: 'Islam' },
    { value: 'CHRISTIAN', label: 'Christianity' },
    { value: 'HINDU', label: 'Hinduism' },
    { value: 'OTHER', label: 'Other' }
  ];

  occupationOptions = [
    { value: 'EMPLOYED', label: 'Employed' },
    { value: 'SELF_EMPLOYED', label: 'Self Employed' },
    { value: 'STUDENT', label: 'Student' },
    { value: 'BUSINESS', label: 'Business' },
    { value: 'OTHER', label: 'Other' }
  ];

  userTypeOptions = [
    { value: 'ADMIN', label: 'Administrator' },
    { value: 'MANAGER', label: 'Manager' },
    { value: 'USER', label: 'User' },
    { value: 'VIEWER', label: 'Viewer' }
  ];

  statusOptions = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'SUSPENDED', label: 'Suspended' }
  ];

  constructor(
    private _fb: FormBuilder,
    private _activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.initForm();
    this._activatedRoute.queryParams.subscribe(params => {
      this.formId = params['f'] || '';
      this.headerTitle = params['formTitle'] || 'Create User';
      this.rowId = params['id'] || '';

      if (this.rowId) {
        this.loadForEdit(this.rowId);
      }
    });
  }

  initForm(): void {
    this.userForm = this._fb.group({
      // Personal Information
      customerName: ['', Validators.required],
      companyCode: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]],
      cnic: ['', [Validators.required, Validators.pattern(/^[0-9]{5}-[0-9]{7}-[0-9]$/)]],
      ntn: ['', [Validators.pattern(/^[0-9]{7}-[0-9]$/)]],
      fatherName: ['', Validators.required],
      gender: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      maritalStatus: ['', Validators.required],
      nationality: ['', Validators.required],
      religion: ['', Validators.required],
      occupation: ['', Validators.required],

      // Contact Information
      email: ['', [Validators.required, Validators.email]],
      phoneNo: ['', [Validators.required, Validators.pattern(/^[0-9]{11}$/)]],
      mobileNo: ['', [Validators.required, Validators.pattern(/^[0-9]{11}$/)]],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],
      postalCode: ['', [Validators.pattern(/^[0-9]{5}$/)]],

      // Account Information
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      userType: ['', Validators.required],
      status: ['ACTIVE', Validators.required],
      isActive: [true]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ mismatch: true });
    } else {
      form.get('confirmPassword')?.setErrors(null);
    }
    return null;
  }

  loadForEdit(rowId: string): void {
    // Load user data for edit
    // This will be implemented when API is ready
    console.log('Loading user for edit:', rowId);
  }

  onSave(): void {
    this.submitted = true;
    if (this.userForm.invalid) {
      Object.keys(this.userForm.controls).forEach(key => {
        const control = this.userForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    console.log('Form submitted:', this.userForm.value);
    // API call will go here
  }

  onUpdate(): void {
    this.submitted = true;
    if (this.userForm.invalid) {
      Object.keys(this.userForm.controls).forEach(key => {
        const control = this.userForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    console.log('Form updated:', this.userForm.value);
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
    this.userForm.reset();
    this.userForm.patchValue({
      status: 'ACTIVE',
      isActive: true
    });
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
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
  get f() { return this.userForm.controls; }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.userForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched || this.submitted));
  }

  getFieldError(fieldName: string): string {
    const control = this.userForm.get(fieldName);
    if (!control || !control.errors) return '';

    const errors = control.errors;
    if (errors['required']) return 'This field is required';
    if (errors['minlength']) return `Minimum length is ${errors['minlength'].requiredLength} characters`;
    if (errors['maxlength']) return `Maximum length is ${errors['maxlength'].requiredLength} characters`;
    if (errors['email']) return 'Please enter a valid email address';
    if (errors['pattern']) return 'Invalid format';
    if (errors['mismatch']) return 'Passwords do not match';

    return 'Invalid value';
  }
}