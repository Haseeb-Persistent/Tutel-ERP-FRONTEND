// erp-login.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-erp-login',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './erp-login.component.html',
  styleUrls: ['./erp-login.component.css']
})
export class ErpLoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  returnUrl: string = '/dashboard';
  submitted = false;
  
  // Track field errors from backend
  fieldErrors: { [key: string]: string[] } = {};

  // ✅ Track previous values to prevent false clears
  private previousValues: { [key: string]: string } = {};

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef // ✅ Inject ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });

    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  onSubmit(): void {
    this.submitted = true;
    
    // Clear previous errors
    this.fieldErrors = {};
    this.errorMessage = '';
    this.previousValues = {};

    // Check if form is invalid (frontend validation)
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        control?.markAsTouched();
      });
      this.cdr.detectChanges(); // ✅ Force immediate UI update
      return;
    }

    this.isLoading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Login response:', response);
        
        if (response.responseCode === 0) {
          this.router.navigate([this.returnUrl]);
        } else {
          this.errorMessage = response.message || 'Login failed';
          this.cdr.detectChanges(); // ✅ Force UI update
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Full error object:', error);
        
        // ✅ Always force UI update on error
        this.cdr.detectChanges();

        if (error.status === 401) {
          let errorMsg = 'Invalid username or password';
          if (error.error && error.error.message) {
            errorMsg = error.error.message;
          } else if (error.error && typeof error.error === 'string') {
            errorMsg = error.error;
          }
          
          this.fieldErrors = {
            username: [errorMsg],
            password: [errorMsg]
          };
          
          // Mark fields as touched to show red border
          Object.keys(this.loginForm.controls).forEach(key => {
            this.loginForm.get(key)?.markAsTouched();
          });
          
          this.errorMessage = errorMsg;
          this.cdr.detectChanges(); // ✅ Force UI update
        } 
        else if (error.status === 400 && error.error?.errors) {
          this.fieldErrors = error.error.errors;
          this.errorMessage = error.error.message || 'Validation failed';
          
          Object.keys(this.fieldErrors).forEach(key => {
            const control = this.loginForm.get(key.toLowerCase());
            if (control) {
              control.markAsTouched();
            }
          });
          this.cdr.detectChanges(); // ✅ Force UI update
        } 
        else {
          if (error.error && error.error.message) {
            this.errorMessage = error.error.message;
          } else if (error.message) {
            this.errorMessage = error.message;
          } else {
            this.errorMessage = 'Login failed. Please try again.';
          }
          this.cdr.detectChanges(); // ✅ Force UI update
        }
      }
    });
  }

  // Helper to check if field has backend errors
  hasFieldError(fieldName: string): boolean {
    return this.fieldErrors[fieldName] && this.fieldErrors[fieldName].length > 0;
  }

  // Helper to get field backend errors
  getFieldErrors(fieldName: string): string[] {
    return this.fieldErrors[fieldName] || [];
  }

  // ✅ BLUR: Forces the touched state immediately
  onFieldBlur(fieldName: string): void {
    const control = this.loginForm.get(fieldName);
    if (control) {
      control.markAsTouched();
      this.cdr.detectChanges(); // ✅ Force UI update
    }
  }

  // ✅ CHANGE: Only clears errors if value actually changed
  onFieldChange(fieldName: string): void {
    const control = this.loginForm.get(fieldName);
    const currentValue = control?.value?.trim() || '';

    // Only clear errors if the user has actually typed a new character
    if (this.previousValues[fieldName] !== currentValue) {
      this.previousValues[fieldName] = currentValue;

      // Clear the specific field error if the user has typed something
      if (currentValue !== '') {
        if (this.fieldErrors[fieldName]) {
          delete this.fieldErrors[fieldName];
          this.cdr.detectChanges(); // ✅ Force UI update
        }
      }
    }

    // Clear the global message if the whole form becomes valid
    if (this.loginForm.valid) {
      this.errorMessage = '';
    }
  }

  get f() { return this.loginForm.controls; }
}