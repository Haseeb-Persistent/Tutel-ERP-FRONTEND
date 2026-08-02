// erp-login.component.ts
import { Component, OnInit } from '@angular/core';
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

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Original FormBuilder with validators
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  onSubmit(): void {
    this.submitted = true;
    
    // Clear previous backend errors
    this.fieldErrors = {};
    this.errorMessage = '';

    // Check if form is invalid (frontend validation)
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        control?.markAsTouched();
      });
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
          // Show backend error message
          this.errorMessage = response.message || 'Login failed';
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Full error object:', error);
        console.error('Error status:', error.status);
        console.error('Error error property:', error.error);
        
        if (error.status === 401) {
          // Get error message
          let errorMsg = 'Invalid username or password';
          if (error.error && error.error.message) {
            errorMsg = error.error.message;
          } else if (error.error && typeof error.error === 'string') {
            errorMsg = error.error;
          }
          
          // Show error in field border like validation
          this.fieldErrors = {
            username: [errorMsg],
            password: [errorMsg]
          };
          
          // Mark fields as touched to show red border
          Object.keys(this.loginForm.controls).forEach(key => {
            this.loginForm.get(key)?.markAsTouched();
          });
          
          // Also show in alert
          this.errorMessage = errorMsg;
        } 
        else if (error.status === 400 && error.error?.errors) {
          this.fieldErrors = error.error.errors;
          this.errorMessage = error.error.message || 'Validation failed';
          
          // Mark fields with errors as touched
          Object.keys(this.fieldErrors).forEach(key => {
            const control = this.loginForm.get(key.toLowerCase());
            if (control) {
              control.markAsTouched();
            }
          });
        } 
        // Handle other errors
        else {
          if (error.error && error.error.message) {
            this.errorMessage = error.error.message;
          } else if (error.message) {
            this.errorMessage = error.message;
          } else {
            this.errorMessage = 'Login failed. Please try again.';
          }
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

  onFieldChange(fieldName: string): void {
    const control = this.loginForm.get(fieldName);
    const currentValue = control?.value;
    
    if (currentValue && currentValue.trim() !== '') {
      if (this.fieldErrors[fieldName]) {
        delete this.fieldErrors[fieldName];
      }
      
      if (this.loginForm.valid) {
        this.errorMessage = '';
      }
    }
  }

  get f() { return this.loginForm.controls; }
}