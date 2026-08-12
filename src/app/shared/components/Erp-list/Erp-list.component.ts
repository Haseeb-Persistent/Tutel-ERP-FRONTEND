import { Component, signal, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from '../../../core/services/DialogService';
import { GridService } from '../../../core/services/grid.service';
import { PaginationComponent } from '../pagination/pagination.component';
import { NgxUiLoaderModule } from "ngx-ui-loader";

@Component({
  selector: 'app-erp-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './Erp-list.component.html',
  styleUrls: ['./Erp-list.component.css']
})
export class ErpList implements OnInit, OnDestroy {
  @ViewChild('tableWrapper') tableWrapper!: ElementRef;
  
  table2: any[] = [];
  totalRecords = 0;
  formTitle: string = '';
  formId: string = '';
  formName: string = '';
  table1: any = {};
  Route: string = '';
  allData: any[] = [];
  sortColumn: string = '';
  isAsc: boolean = true;
  isAddNewVisible: boolean = true;
  isLoading: boolean = false;

  // Pagination properties
  pageNumber: number = 1;
  pageSize: number = 14;

  // Search
  searchKeyword: string = '';

  gridHeaders = signal<string[]>([]);
  gridColumns = signal<string[]>([]);

  private paramSubscription: any;
  private querySubscription: any;

  constructor(
    private gridService: GridService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService
  ) { }

  ngOnInit() {
    this.clearSearch()
    this.paramSubscription = this.activatedRoute.paramMap.subscribe((params) => {
      this.formName = params.get('formName') || 'Dashboard';
      this.formId = this.formName;
      this.loadPageData();
    });

    this.querySubscription = this.activatedRoute.queryParams.subscribe((params) => {
      this.formTitle = params['formTitle'] || `${this.formName} Setup`;
      const dynamicRoute = params['formRoute'];
      this.table1 = {
        insert_allowed: 1,
        link_form: dynamicRoute,
        form_id: this.formId
      };
      this.Route = this.table1.link_form;
      this.isAddNewVisible = true;
    });
  }

  loadPageData() {
    this.isLoading = true;
    this.table2 = [];
    this.allData = [];
    this.gridColumns.set([]);
    this.gridHeaders.set([]);
    this.pageNumber = 1;
    
    // Call your API service
    this.gridService.getGridData(this.formName).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        
        // Handle the response based on your API structure
        let data = res;
        
        // If your API returns data in a specific property
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
          this.table2 = [];
          this.allData = [];
          this.totalRecords = 0;
          this.gridColumns.set([]);
          this.gridHeaders.set([]);
          return;
        }

        this.table1 = {
          insert_allowed: 1,
          link_form: this.Route,
          form_id: this.formId
        };
        this.isAddNewVisible = true;

        const allRows = data;
        this.allData = allRows;

        if (allRows.length > 0) {
          const allKeys = Object.keys(allRows[0]);
          
          // Filter out system columns if needed
          const filteredKeys = allKeys.filter(key => {
            const lowerKey = key.toLowerCase();
            // Hide system columns
            if (lowerKey === 'id' || 
                lowerKey === 'rowid' || 
                lowerKey === 'createddate' || 
                lowerKey === 'created_on' || 
                lowerKey === 'updated_by' || 
                lowerKey === 'updated_on' ||
                lowerKey === 'maker' ||
                lowerKey === 'maker_date' ||
                lowerKey === 'authorizer' ||
                lowerKey === 'authorizer_date' ||
                lowerKey === 'rcstatus') {
              return false;
            }
            return true;
          });
          
          this.gridColumns.set(filteredKeys);
          this.gridHeaders.set([...filteredKeys]);
        }

        this.table2 = allRows;
        this.totalRecords = this.table2.length;
        
        // Reset to first page
        this.pageNumber = 1;
      },
      error: (err) => {
        this.isLoading = false;
        const Message = err?.error?.message || 'Error loading data';
        this.dialogService.alertBox(Message);
        this.table2 = [];
        this.allData = [];
        this.totalRecords = 0;
      }
    });
  }

  ngOnDestroy() {
    if (this.paramSubscription) this.paramSubscription.unsubscribe();
    if (this.querySubscription) this.querySubscription.unsubscribe();
  }

  getCurrentPageData(): any[] {
    const startIndex = (this.pageNumber - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.totalRecords);
    return this.table2.slice(startIndex, endIndex);
  }

  addNewSetup() {
    this.router.navigate([`/app/${this.Route}`], {
      queryParams: { f: this.formName, formTitle: this.formTitle }
    });
  }

  onRowClick(data: any) {
    // Try to find the ID field
    const recordId = data?.recordId || data?.id || data?.RowID || data?.rowid || data?.['Record ID'];
    if (!recordId) {
      this.dialogService.alertBox('Record ID not found.');
      return;
    }
    this.router.navigate([`/app/${this.Route}`], {
      queryParams: {
        f: this.formName,
        id: recordId,
        formTitle: this.formTitle
      }
    });
  }

  onDelete(recordId: string) {
    if (!recordId) {
      this.dialogService.alertBox('Record ID not found.');
      return;
    }
    
    this.dialogService.confirmBox('Are you sure you want to delete this record?').then((confirmed) => {
      if (!confirmed) return;
      
      const id = typeof recordId === 'string' ? parseInt(recordId, 10) : recordId;
      this.gridService.deleteRecord(this.formName, id).subscribe({
        next: () => {
          this.dialogService.alertBox('Record deleted successfully.');
          this.loadPageData(); // Reload data
        },
        error: (err) => {
          const message = err?.error?.message || 'Error deleting record.';
          this.dialogService.alertBox(message);
        }
      });
    });
  }

  onSearch() { 
  const keyword = this.searchKeyword?.trim().toLowerCase() || '';
  if (!keyword) {
    this.table2 = [...this.allData];
  } else {
    const filteredResults = this.allData.filter(row =>
      Object.values(row).some(value =>
        value && value.toString().toLowerCase().includes(keyword)
      )
    );
    this.table2 = filteredResults; 
  }
  this.totalRecords = this.table2.length;
  this.pageNumber = 1;
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
    this.table2.sort((a, b) => {
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
  }

  onPageChange(event: { pageNumber: number; pageSize: number }) {
    this.pageNumber = event.pageNumber;
    this.pageSize = event.pageSize;
    if (this.tableWrapper) {
      this.tableWrapper.nativeElement.scrollTop = 0;
    }
  }

  onPageSizeChange(event: { pageNumber: number; pageSize: number }) {
    this.pageSize = event.pageSize;
    this.pageNumber = 1;
  }

  onBack() {
    window.history.back();
  }
}