import { ChangeDetectorRef, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GridService } from '../../../core/services/grid.service';
import { DialogService } from '../../../core/services/DialogService';
import { PaginationComponent } from '../pagination/pagination.component';
import { filterGridColumnsModal } from '../../helper/modal-grid-columns.helper';

@Component({
  selector: 'app-lov-modal',
  standalone: true,
  imports: [CommonModule, FormsModule,PaginationComponent],
  templateUrl: './erp-modal.component.html',
  styleUrls: ['./erp-modal.component.css']
})
export class LovModalComponent {
  @Input() modalName: string = 'Select Country';
  @Input() formName: string = 'Country';
  @Input() selectedValue?: any;

  @ViewChild('modalContainer') modalContainer!: ElementRef;
  @ViewChild('modalDataScroll') modalDataScroll!: ElementRef;

  gridHeaders: string[] = [];
  gridRows: any[] = [];           // ✅ Full filtered data
  currentPageData: any[] = [];    // ✅ Data for current page
  totalRecords: number = 0;
  isLoading: boolean = false;
  searchKeyword: string = '';
  
  pageNumber: number = 1;
  pageSize: number = 10;
  
  sortColumn: string = '';
  isAsc: boolean = true;
  
  private allData: any[] = [];

  constructor(
    private activeModal: NgbActiveModal,
    private gridService: GridService,
    private dialogService: DialogService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadData();
  }

loadData() {
  this.isLoading = true;
  this.gridService.getGridData(this.formName).subscribe({
    next: (res: any) => {
      this.isLoading = false;
      let data = res;
      if (res && res.data) {
        data = res.data;
      } else if (res && res.Table) {
        data = res.Table;
      } else if (Array.isArray(res)) {
        data = res;
      } else {
        data = [];
      }

      if (!data || !Array.isArray(data) || data.length === 0) {
        this.allData = [];
        this.gridRows = [];
        this.currentPageData = [];
        this.totalRecords = 0;
        this.gridHeaders = [];
        this.cdr.detectChanges();
        return;
      }

      this.allData = data;
      this.gridRows = data;
      this.totalRecords = data.length;
     if (data.length > 0) {
  const allKeys = Object.keys(data[0]);
  const filteredKeys = filterGridColumnsModal(allKeys);
  this.gridHeaders = filteredKeys;
}
      this.applyPagination();
      this.cdr.detectChanges();
    },
    error: (err) => {
      this.isLoading = false;
      const msg = err?.error?.message || 'Error loading data';
      this.dialogService.alertBox(msg);
      this.allData = [];
      this.gridRows = [];
      this.currentPageData = [];
      this.totalRecords = 0;
      this.gridHeaders = [];
      this.cdr.detectChanges();
    }
  });
}

  onSearch() {
    const keyword = this.searchKeyword?.trim().toLowerCase() || '';
    
    let filteredData: any[] = [];
    
    if (!keyword) {
      filteredData = [...this.allData];
    } else {
      filteredData = this.allData.filter(row =>
        Object.values(row).some(value =>
          value && value.toString().toLowerCase().includes(keyword)
        )
      );
    }
    
    // ✅ Store filtered data
    this.gridRows = filteredData;
    this.totalRecords = filteredData.length;
    this.pageNumber = 1;
    
    // ✅ Apply pagination to the filtered data
    this.applyPagination();
    this.scrollToTop();
  }

  clearSearch() {
    this.searchKeyword = '';
    this.onSearch();
  }

  onSort(column: string) {
    if (this.sortColumn === column) {
      this.isAsc = !this.isAsc;
    } else {
      this.sortColumn = column;
      this.isAsc = true;
    }

    this.gridRows.sort((a, b) => {
      let valA = a[column];
      let valB = b[column];
      if (valA == null) valA = '';
      if (valB == null) valB = '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return this.isAsc ? -1 : 1;
      if (valA > valB) return this.isAsc ? 1 : -1;
      return 0;
    });
    
    this.applyPagination();
  }

  onRowDoubleClick(row: any) {
    this.activeModal.close(row);
  }

  onRowClick(row: any) {
    this.activeModal.close(row);
  }

  closeDialog() {
    this.activeModal.dismiss();
  }

  scrollToTop(): void {
    const el = this.modalDataScroll?.nativeElement;
    if (el) {
      el.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  applyPagination() {
    const startIndex = (this.pageNumber - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.gridRows.length);
    this.currentPageData = this.gridRows.slice(startIndex, endIndex);
  }

  onPageChange(event: { pageNumber: number; pageSize: number }) {
    this.pageNumber = event.pageNumber;
    this.pageSize = event.pageSize;
    this.applyPagination();
    this.scrollToTop();
  }

  onPageSizeChange(event: { pageNumber: number; pageSize: number }) {
    this.pageSize = event.pageSize;
    this.pageNumber = 1;
    this.applyPagination();
  }

  getCurrentPageData(): any[] {
    return this.currentPageData;
  }
}