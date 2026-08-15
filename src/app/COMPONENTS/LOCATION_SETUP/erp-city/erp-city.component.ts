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
  selector: 'app-erp-city',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CrudButton,
    RouterModule,
    LimitInputDirective,
  ],
  templateUrl: './erp-city.component.html',
})
export class ErpCityComponent implements OnInit {
  cityForm!: FormGroup;
  submitted = false;
  formId = '';
  headerTitle = 'City Setup';
  rowId = '';
  isEditMode = false;
  isLoading = false;
  isSaving = false;
  fieldErrors: { [key: string]: string[] } = {};

  provinceList: any[] = [];
  selectedProvinceName: string = '';

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
    this.loadProvinces();

    this._activatedRoute.queryParams.subscribe((params) => {
      this.formId = params['f'] || 'City';
      this.headerTitle = params['formTitle'] || 'City Setup';
      this.rowId = params['id'] || '';
      this.isEditMode = !!this.rowId;
      this.isEditMode ? this.loadForEdit(this.rowId) : this.onReset();
    });
  }

  initForm(): void {
    this.cityForm = this._fb.group({
      cityId: [0],
      provinceId: ['', Validators.required],
      cityName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      isActive: [true, Validators.required],
    });
  }

  loadProvinces() {
    this.gridService.getGridData('Province').subscribe({
      next: (res: any) => {
        if (Array.isArray(res)) {
          this.provinceList = res;
        }
      },
      error: () => {},
    });
  }

  loadForEdit(rowId: string): void {
    this.isLoading = true;
    this.gridService.GettAllOptions(this.formId, rowId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (data) => {
          if (data) {
            const provinceId = data['ProvinceId'] || data['provinceId'] || data['provinceid'] || 0;
            const provinceName = data['ProvinceName'] || data['provinceName'] || data['provincename'] || '';

            this.cityForm.patchValue({
              provinceId: provinceId,
              cityName: data['CityName'] || data['cityName'] || '',
              isActive: data['IsActive'] ?? data['isActive'] ?? true,
            });
            this.selectedProvinceName = provinceName;
            this.cdr.detectChanges();
          }
        },
        error: () => this.dialog.alertBox('Failed to load record details.'),
      });
  }

  onFieldChange(fieldName: string): void {
    if (this.cityForm.get(fieldName)?.value?.toString().trim()) {
      delete this.fieldErrors[fieldName];
    }
  }

  openProvinceModal() {
    const modalRef = this.modalService.open(LovModalComponent, {
      backdrop: 'static',
      keyboard: true,
      centered: true,
      size: 'lg',
    });

    modalRef.componentInstance.modalName = 'Select Province';
    modalRef.componentInstance.formName = 'Province';

    modalRef.result
      .then((selectedRow) => {
        if (selectedRow) {
          const provinceId = Number(
            selectedRow.provinceId || selectedRow.ProvinceId || selectedRow.recordId
          );
          const provinceName =
            selectedRow.provinceName || selectedRow.ProvinceName || '';

          if (!provinceId || isNaN(provinceId) || provinceId <= 0) {
            this.dialog.alertBox('Invalid Province selected.');
            return;
          }

          this.cityForm.patchValue({
            provinceId: provinceId,
          });
          this.selectedProvinceName = provinceName;
          delete this.fieldErrors['provinceId'];
          this.cityForm.get('provinceId')?.markAsTouched();
          this.cdr.detectChanges();
          this.cityForm.updateValueAndValidity();
        }
      })
      .catch(() => {});
  }

  // ─── STEP 1: PREPARE AND VALIDATE PAYLOAD BEFORE SUBMITTING ──────────
  private preparePayload(): any | null {
    const formValue = this.cityForm.value;
    const provinceId = Number(formValue.provinceId);

    // ✅ Validate Province ID
    if (!provinceId || isNaN(provinceId) || provinceId <= 0) {
      this.dialog.alertBox('Please select a valid Province.');
      this.cityForm.get('provinceId')?.markAsTouched();
      return null;
    }

    // ✅ Return valid payload (Nested inside 'data' for C# DTO)
    return {
      formId: this.formId,
      data: {
        provinceId: provinceId,
        cityName: formValue.cityName,
        isActive: formValue.isActive,
      },
      recordId: this.isEditMode ? this.rowId : null,
    };
  }

  // ─── STEP 2: UNIFIED SUBMIT METHOD ────────────────────────────────────
  private async submitRecord(): Promise<void> {
    if (this.isSaving || this.cityForm.invalid) {
      if (this.cityForm.invalid) this.markAllFieldsTouched();
      return;
    }

    const payload = this.preparePayload();
    if (!payload) return; // Validation failed, stop here.

    this.submitted = true;
    this.fieldErrors = {};
    this.isSaving = true;

    try {
      let res: any;

      if (this.isEditMode) {
        res = await firstValueFrom(
          this.gridService.updateRecord(this.formId, payload)
        );
      } else {
        res = await firstValueFrom(
          this.gridService.insertRecord(this.formId, payload)
        );
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
        Object.keys(this.fieldErrors).forEach((key) =>
          this.cityForm.get(key)?.markAsTouched()
        );
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
    this.selectedProvinceName = '';
    this.cityForm.reset({ cityId: 0, isActive: true });
    this.isEditMode = false;
    this.markAllFieldsPristine();
    this.cdr.detectChanges();
  }

  onBack(): void {
    this._router.navigate([`/app/ErpList/${this.formId}`], {
      queryParams: { formTitle: this.headerTitle },
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const c = this.cityForm.get(fieldName);
    return (
      !!(c?.invalid && (c.dirty || c.touched || this.submitted)) ||
      this.hasFieldError(fieldName)
    );
  }

  getFieldError(fieldName: string): string {
    if (this.hasFieldError(fieldName)) return this.fieldErrors[fieldName][0];
    const e = this.cityForm.get(fieldName)?.errors;
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
    Object.keys(this.cityForm.controls).forEach((key) =>
      this.cityForm.get(key)?.markAsTouched()
    );
  }

  private markAllFieldsPristine(): void {
    Object.keys(this.cityForm.controls).forEach((key) => {
      const c = this.cityForm.get(key);
      c?.markAsPristine();
      c?.markAsUntouched();
    });
  }

  get f() {
    return this.cityForm.controls;
  }
}