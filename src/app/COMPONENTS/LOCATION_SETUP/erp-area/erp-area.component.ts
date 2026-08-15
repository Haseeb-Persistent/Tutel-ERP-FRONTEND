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
  selector: 'app-erp-area',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CrudButton, RouterModule, LimitInputDirective],
  templateUrl: './erp-area.component.html',
})
export class ErpAreaComponent implements OnInit {
  areaForm!: FormGroup;
  submitted = false;
  formId = '';
  headerTitle = 'Area Setup';
  rowId = '';
  isEditMode = false;
  isLoading = false;
  isSaving = false;
  fieldErrors: { [key: string]: string[] } = {};
  cityList: any[] = [];
  selectedCityName: string = '';

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
    this.loadCities();
    this._activatedRoute.queryParams.subscribe(params => {
      this.formId = params['f'] || 'Area';
      this.headerTitle = params['formTitle'] || 'Area Setup';
      this.rowId = params['id'] || '';
      this.isEditMode = !!this.rowId;
      this.isEditMode ? this.loadForEdit(this.rowId) : this.onReset();
    });
  }

  initForm(): void {
    this.areaForm = this._fb.group({
      areaId: [0],
      cityId: ['', Validators.required],
      areaName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      postalCode: ['', [Validators.maxLength(20)]],
      isActive: [true, Validators.required],
    });
  }

  loadCities() {
    this.gridService.getGridData('City').subscribe({
      next: (res: any) => {
        if (Array.isArray(res)) {
          this.cityList = res;
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
            const cityId = data['CityId'] || data['cityId'] || data['cityid'] || 0;
            const cityName = data['CityName'] || data['cityName'] || data['cityname'] || '';

            this.areaForm.patchValue({
              cityId: cityId,
              areaName: data['AreaName'] || data['areaName'] || '',
              postalCode: data['PostalCode'] || data['postalCode'] || '',
              isActive: data['IsActive'] ?? data['isActive'] ?? true,
            });
            this.selectedCityName = cityName;
            this.cdr.detectChanges();
          }
        },
        error: () => this.dialog.alertBox('Failed to load record details.')
      });
  }

  onFieldChange(fieldName: string): void {
    if (this.areaForm.get(fieldName)?.value?.toString().trim()) {
      delete this.fieldErrors[fieldName];
    }
  }

  openCityModal() {
    const modalRef = this.modalService.open(LovModalComponent, {
      backdrop: 'static',
      keyboard: true,
      centered: true,
      size: 'lg',
    });

    modalRef.componentInstance.modalName = 'Select City';
    modalRef.componentInstance.formName = 'City';

    modalRef.result
      .then((selectedRow) => {
        if (selectedRow) {
          const cityId = Number(
            selectedRow.cityId || selectedRow.CityId || selectedRow.recordId
          );
          const cityName =
            selectedRow.cityName || selectedRow.CityName || '';

          if (!cityId || isNaN(cityId) || cityId <= 0) {
            this.dialog.alertBox('Invalid City selected.');
            return;
          }

          this.areaForm.patchValue({
            cityId: cityId,
          });
          this.selectedCityName = cityName;
          delete this.fieldErrors['cityId'];
          this.areaForm.get('cityId')?.markAsTouched();
          this.cdr.detectChanges();
          this.areaForm.updateValueAndValidity();
        }
      })
      .catch(() => {});
  }

  private preparePayload(): any | null {
    const formValue = this.areaForm.value;
    const cityId = Number(formValue.cityId);

    if (!cityId || isNaN(cityId) || cityId <= 0) {
      this.dialog.alertBox('Please select a valid City.');
      this.areaForm.get('cityId')?.markAsTouched();
      return null;
    }

    return {
      formId: this.formId,
      data: {
        cityId: cityId,
        areaName: formValue.areaName,
        postalCode: formValue.postalCode,
        isActive: formValue.isActive,
      },
      recordId: this.isEditMode ? this.rowId : null,
    };
  }

  private async submitRecord(): Promise<void> {
    if (this.isSaving || this.areaForm.invalid) {
      if (this.areaForm.invalid) this.markAllFieldsTouched();
      return;
    }

    const payload = this.preparePayload();
    if (!payload) return;

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
          this.areaForm.get(key)?.markAsTouched()
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
    this.selectedCityName = '';
    this.areaForm.reset({ areaId: 0, isActive: true });
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
    const c = this.areaForm.get(fieldName);
    return (
      !!(c?.invalid && (c.dirty || c.touched || this.submitted)) ||
      this.hasFieldError(fieldName)
    );
  }

  getFieldError(fieldName: string): string {
    if (this.hasFieldError(fieldName)) return this.fieldErrors[fieldName][0];
    const e = this.areaForm.get(fieldName)?.errors;
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
    Object.keys(this.areaForm.controls).forEach((key) =>
      this.areaForm.get(key)?.markAsTouched()
    );
  }

  private markAllFieldsPristine(): void {
    Object.keys(this.areaForm.controls).forEach((key) => {
      const c = this.areaForm.get(key);
      c?.markAsPristine();
      c?.markAsUntouched();
    });
  }

  get f() {
    return this.areaForm.controls;
  }
}