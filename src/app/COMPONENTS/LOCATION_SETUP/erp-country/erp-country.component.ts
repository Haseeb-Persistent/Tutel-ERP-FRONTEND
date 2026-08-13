import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CrudButton } from '../../../shared/components/crud-button/crud-button';
import { LimitInputDirective } from '../../../shared/directive/limit-input';
import { finalize, firstValueFrom } from 'rxjs';
import { DialogService } from '../../../core/services/DialogService';
import { GridService } from '../../../core/services/grid.service';
import { isErrorMessage } from '../../../shared/helper/errorMess';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LovModalComponent } from '../../../shared/components/erp-modal/erp-modal.component';

@Component({
  selector: 'app-erp-country',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CrudButton, RouterModule, LimitInputDirective,],
  templateUrl: './erp-country.component.html',
})
export class ErpCountryComponent implements OnInit {
  countryForm!: FormGroup;
  submitted = false;
  formId = '';
  headerTitle = '';
  rowId = '';
  isEditMode = false;
  isLoading = false;
  isSaving = false;
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
      this.isEditMode = !!this.rowId;
      this.isEditMode ? this.loadForEdit(this.rowId) : this.onReset();
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
  this.gridService.GettAllOptions(this.formId, rowId)
    .pipe(finalize(() => this.isLoading = false))
    .subscribe({
      next: (data) => {
        if (data) {
          const patchData = {
            countryId: data['CountryId'] || data['countryId'] || data['countryid'] || 0,
            countryName: data['CountryName'] || data['countryName'] || data['countryname'] || '',
            countryCode: data['CountryCode'] || data['countryCode'] || data['countrycode'] || '',
            isActive: data['IsActive'] ?? data['isActive'] ?? data['isactive'] ?? true
          };
          
          this.countryForm.patchValue(patchData);
          
          if (!this.countryForm.get('countryName')?.value) {
            this.countryForm.setValue(patchData);
          }
        }
      },
      error: () => this.dialog.alertBox('Failed to load record details.')
    });
}

  onFieldChange(fieldName: string): void {
    if (this.countryForm.get(fieldName)?.value?.toString().trim()) {
      delete this.fieldErrors[fieldName];
    }
  }

  async onSave(): Promise<void> {
    if (this.isSaving || this.countryForm.invalid) {
      if (this.countryForm.invalid) this.markAllFieldsTouched();
      return;
    }
    this.submitted = true;
    this.fieldErrors = {};
    this.isSaving = true;

    try {
      const res = await firstValueFrom(this.gridService.insertRecord(this.formId, {
        formId: this.formId,
        data: {
          countryName: this.countryForm.value.countryName,
          countryCode: this.countryForm.value.countryCode,
          isActive: this.countryForm.value.isActive
        }
      }));
      this.isSaving = false;
      if (res?.message) await this.dialog.alertBox(res.message);
      if (!isErrorMessage(res?.message)) window.history.back();
    } catch (error: any) {
      this.isSaving = false;
      if (error.status === 400 && error.error?.errors) {
        this.fieldErrors = error.error.errors;
        Object.keys(this.fieldErrors).forEach(key => this.countryForm.get(key)?.markAsTouched());
      } else {
        const msg = error?.error?.message || error?.message;
        if (msg) await this.dialog.alertBox(msg);
      }
    }
  }

  async onUpdate(): Promise<void> {
    if (this.isSaving || this.countryForm.invalid) {
      if (this.countryForm.invalid) this.markAllFieldsTouched();
      return;
    }
    this.submitted = true;
    this.fieldErrors = {};
    this.isSaving = true;

    try {
      const res = await firstValueFrom(this.gridService.updateRecord(this.formId, {
        formId: this.formId,
        data: {
          countryName: this.countryForm.value.countryName,
          countryCode: this.countryForm.value.countryCode,
          isActive: this.countryForm.value.isActive
        },
        recordId: this.rowId
      }));
      if (res?.message) await this.dialog.alertBox(res.message);
      if (!isErrorMessage(res?.message)) {
        this.isEditMode = false;
        window.history.back();
      }
    } catch (error: any) {
      if (error.status === 400 && error.error?.errors) {
        this.fieldErrors = error.error.errors;
        Object.keys(this.fieldErrors).forEach(key => this.countryForm.get(key)?.markAsTouched());
      } else {
        const msg = error?.error?.message || error?.message;
        if (msg) await this.dialog.alertBox(msg);
      }
    } finally {
      this.isSaving = false;
    }
  }

  onReset(): void {
    this.submitted = false;
    this.fieldErrors = {};
    this.countryForm.reset({ countryId: 0, isActive: true });
    this.isEditMode = false;
    this.markAllFieldsPristine();
  }

  onBack(): void {
    this._router.navigate([`/app/ErpList/${this.formId}`], { queryParams: { formTitle: this.headerTitle } });
  }

  isFieldInvalid(fieldName: string): boolean {
    const c = this.countryForm.get(fieldName);
    return !!(c?.invalid && (c.dirty || c.touched || this.submitted)) || this.hasFieldError(fieldName);
  }

  getFieldError(fieldName: string): string {
    if (this.hasFieldError(fieldName)) return this.fieldErrors[fieldName][0];
    const e = this.countryForm.get(fieldName)?.errors;
    if (!e) return '';
    if (e['required']) return 'This field is required';
    if (e['minlength']) return `Minimum ${e['minlength'].requiredLength} characters`;
    if (e['maxlength']) return `Maximum ${e['maxlength'].requiredLength} characters`;
    return 'Invalid value';
  }

  hasFieldError(fieldName: string): boolean {
    return !!this.fieldErrors[fieldName]?.length;
  }

  getFieldErrors(fieldName: string): string[] {
    return this.fieldErrors[fieldName] || [];
  }

  private markAllFieldsTouched(): void {
    Object.keys(this.countryForm.controls).forEach(key => this.countryForm.get(key)?.markAsTouched());
  }

  private markAllFieldsPristine(): void {
    Object.keys(this.countryForm.controls).forEach(key => {
      const c = this.countryForm.get(key);
      c?.markAsPristine();
      c?.markAsUntouched();
    });
  }

  get f() { return this.countryForm.controls; }
}