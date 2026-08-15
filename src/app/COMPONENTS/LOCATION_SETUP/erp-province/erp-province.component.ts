import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  selector: 'app-erp-province',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CrudButton, RouterModule, LimitInputDirective],
  templateUrl: './erp-province.component.html',
})
export class ErpProvinceComponent implements OnInit {
  provinceForm!: FormGroup;
  submitted = false;
  formId = '';
  headerTitle = 'Province Setup';
  rowId = '';
  isEditMode = false;
  isLoading = false;
  isSaving = false;
  fieldErrors: { [key: string]: string[] } = {};
  countryList: any[] = [];
  selectedCountryName: string = '';
  
  statusOptions = [
    { value: true, label: 'Active' },
    { value: false, label: 'Inactive' }
  ];

  constructor(
    private _fb: FormBuilder,
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private dialog: DialogService,
    private gridService: GridService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCountries();
    this._activatedRoute.queryParams.subscribe(params => {
      this.formId = params['f'] || 'Province';
      this.headerTitle = params['formTitle'] || 'Province Setup';
      this.rowId = params['id'] || '';
      this.isEditMode = !!this.rowId;
      this.isEditMode ? this.loadForEdit(this.rowId) : this.onReset();
    });
  }

  initForm(): void {
    this.provinceForm = this._fb.group({
      provinceId: [0],
      countryId: ['', Validators.required],
      provinceCode: ['', [Validators.required, Validators.minLength(2)]],
      provinceName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      isActive: [true, Validators.required],
    });
  }

  loadCountries() {
    this.gridService.getGridData('Country').subscribe({
      next: (res: any) => {
        if (Array.isArray(res)) {
          this.countryList = res;
        }
      },
      error: () => {}
    });
  }

  loadForEdit(rowId: string): void {
    this.isLoading = true;
    this.gridService.GettAllOptions(this.formId, rowId)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data) => {
          if (data) {
            const countryId = data['CountryId'] || data['countryId'] || data['countryid'] || 0;
            const countryName = data['CountryName'] || data['countryName'] || data['countryname'] || '';
            
            this.provinceForm.patchValue({
              countryId: countryId,
              provinceName: data['ProvinceName'] || data['provinceName'] || '',
              provinceCode: data['ProvinceCode'] || data['provinceCode'] || '',
              isActive: data['IsActive'] ?? data['isActive'] ?? true
            });
            this.selectedCountryName = countryName;
            this.cdr.detectChanges();
          }
        },
        error: () => this.dialog.alertBox('Failed to load record details.')
      });
  }

  onFieldChange(fieldName: string): void {
    if (this.provinceForm.get(fieldName)?.value?.toString().trim()) {
      delete this.fieldErrors[fieldName];
    }
  }

  openCountryModal() {
    const modalRef = this.modalService.open(LovModalComponent, {
      backdrop: 'static',
      keyboard: true,
      centered: true,
      size: 'lg'
    });
    
    modalRef.componentInstance.modalName = 'Select Country';
    modalRef.componentInstance.formName = 'Country';
    
    modalRef.result.then((selectedRow) => {
      if (selectedRow) {
        const countryId = Number(selectedRow.countryId || selectedRow.CountryId || selectedRow.recordId);
        const countryName = selectedRow.countryName || selectedRow.CountryName || '';
        
        if (!countryId || isNaN(countryId) || countryId <= 0) {
          this.dialog.alertBox('Invalid Country selected.');
          return;
        }

        this.provinceForm.patchValue({
          countryId: countryId
        });
        this.selectedCountryName = countryName;
        delete this.fieldErrors['countryId'];
        this.provinceForm.get('countryId')?.markAsTouched();
        this.cdr.detectChanges();
        this.provinceForm.updateValueAndValidity();
      }
    }).catch(() => {});
  }

  // ─── STEP 1: PREPARE AND VALIDATE PAYLOAD BEFORE SUBMITTING ──────────
  private preparePayload(): any | null {
    const formValue = this.provinceForm.value;
    const countryId = Number(formValue.countryId);

    // ✅ Check condition right here before constructing payload
    if (!countryId || isNaN(countryId) || countryId <= 0) {
      this.dialog.alertBox('Please select a valid Country.');
      this.provinceForm.get('countryId')?.markAsTouched();
      return null;
    }

    // Return valid payload
    return {
      formId: this.formId,
      countryId: countryId,
      provinceCode: formValue.provinceCode,
      provinceName: formValue.provinceName,
      isActive: formValue.isActive
    };
  }

  // ─── STEP 2: UNIFIED SUBMIT METHOD ────────────────────────────────────
  private async submitRecord(): Promise<void> {
    if (this.isSaving || this.provinceForm.invalid) {
      if (this.provinceForm.invalid) this.markAllFieldsTouched();
      return;
    }

    // ✅ Validate before proceeding
    const payload = this.preparePayload();
    if (!payload) return; // Validation failed, stop here.

    this.submitted = true;
    this.fieldErrors = {};
    this.isSaving = true;

    try {
      let res: any;

      if (this.isEditMode) {
        payload.recordId = this.rowId;
        res = await firstValueFrom(this.gridService.updateRecord(this.formId, payload));
      } else {
        res = await firstValueFrom(this.gridService.insertRecord(this.formId, payload));
      }

      this.isSaving = false;
      if (res?.message) await this.dialog.alertBox(res.message);
      if (!isErrorMessage(res?.message)) {
        window.history.back();
        if (this.isEditMode) this.isEditMode = false;
      }
    } catch (error: any) {
      this.isSaving = false;
      if (error.status === 400 && error.error?.errors) {
        this.fieldErrors = error.error.errors;
        Object.keys(this.fieldErrors).forEach(key => this.provinceForm.get(key)?.markAsTouched());
      } else {
        const msg = error?.error?.message || error?.message;
        if (msg) await this.dialog.alertBox(msg);
      }
    }
  }

  async onSave(): Promise<void> {
    await this.submitRecord();
  }

  async onUpdate(): Promise<void> {
    await this.submitRecord();
  }

  onReset(): void {
    this.submitted = false;
    this.fieldErrors = {};
    this.selectedCountryName = '';
    this.provinceForm.reset({ provinceId: 0, isActive: true });
    this.isEditMode = false;
    this.markAllFieldsPristine();
    this.cdr.detectChanges();
  }

  onBack(): void {
    this._router.navigate([`/app/ErpList/${this.formId}`], { queryParams: { formTitle: this.headerTitle } });
  }

  isFieldInvalid(fieldName: string): boolean {
    const c = this.provinceForm.get(fieldName);
    return !!(c?.invalid && (c.dirty || c.touched || this.submitted)) || this.hasFieldError(fieldName);
  }

  getFieldError(fieldName: string): string {
    if (this.hasFieldError(fieldName)) return this.fieldErrors[fieldName][0];
    const e = this.provinceForm.get(fieldName)?.errors;
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
    Object.keys(this.provinceForm.controls).forEach(key => this.provinceForm.get(key)?.markAsTouched());
  }

  private markAllFieldsPristine(): void {
    Object.keys(this.provinceForm.controls).forEach(key => {
      const c = this.provinceForm.get(key);
      c?.markAsPristine();
      c?.markAsUntouched();
    });
  }

  get f() { return this.provinceForm.controls; }
}