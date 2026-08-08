import { Component, signal, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from '../../../core/services/DialogService';
import { GridService } from '../../../core/services/grid.service';

@Component({
  selector: 'app-erp-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './Erp-list.component.html',
})
export class ErpList implements OnInit, OnChanges, OnDestroy {
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

  requestSearch = {
    pageNumber: 1,
    pageSize: 10, // Changed default to 10 for pagination testing
    keyword: '',
  };

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

  ngOnChanges(changes: SimpleChanges) {
    if (changes['formName'] && !changes['formName'].firstChange) {
      this.loadPageData();
    }
  }

  loadPageData() {
    this.table2 = [];
    this.allData = [];
    this.gridColumns.set([]);
    this.gridHeaders.set([]);
    
    this.gridService.getGridData(this.formName).subscribe({
      next: (res: any) => {
        if (!res || !Array.isArray(res)) {
          this.table2 = [];
          this.allData = [];
          return;
        }

        this.table1 = {
          insert_allowed: 1,
          link_form: this.Route,
          form_id: this.formId
        };
        this.isAddNewVisible = true;

        const allRows = res || [];
        this.allData = allRows;

        if (allRows.length > 0) {
          const hideThese = ['rowid'];
          const allKeys = Object.keys(allRows[0]);
          this.gridColumns.set(allKeys.filter(key => !hideThese.includes(key)));
          this.gridHeaders.set([...this.gridColumns()]);
        }

        this.table2 = allRows;
        this.totalRecords = this.table2.length;
        
        // Reset to page 1 when data reloads
        this.requestSearch.pageNumber = 1;
      },
      error: (err) => {
        const Message = err?.error?.message || 'Error loading data';
        this.dialogService.alertBox(Message);
      }
    });
  }

  ngOnDestroy() {
    if (this.paramSubscription) this.paramSubscription.unsubscribe();
    if (this.querySubscription) this.querySubscription.unsubscribe();
  }

  // ✅ GETTER: Calculate total pages dynamically
  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.requestSearch.pageSize) || 1;
  }

  // ✅ ADD NEW SETUP
  addNewSetup() {
    this.router.navigate([`/app/${this.Route}`], {
      queryParams: { f: this.formName, formTitle: this.formTitle }
    });
  }

  // ✅ ROW CLICK (Edit / View)
  onRowClick(rowId: string) {
    this.router.navigate([`/app/${this.Route}`], {
      queryParams: { 
        f: this.formName, 
        id: rowId,         
        formTitle: this.formTitle 
      }
    });
  }

  // ✅ DELETE RECORD
  onDelete(rowId: string) {
    this.dialogService.confirmBox('Are you sure you want to delete this record?').then((confirmed) => {
      if (!confirmed) return;
      
      const id = parseInt(rowId, 10);
      this.gridService.deleteRecord(this.formName, id).subscribe({
        next: () => {
          this.dialogService.alertBox(`Record deleted successfully.`);
          this.loadPageData(); 
        },
        error: (err) => {
          const message = err?.error?.message || 'Error deleting record.';
          this.dialogService.alertBox(message);
        }
      });
    });
  }

  // ✅ SEARCH
  onSearch() { 
    const keyword = this.requestSearch.keyword?.trim().toLowerCase() || '';
    if (!keyword) {
      this.table2 = [...this.allData];
    } else {
      const filteredResults = this.allData.filter(row =>
        Object.values(row).some(value =>
          value && value.toString().toLowerCase().includes(keyword)
        )
      );
      this.table2 = filteredResults.length > 0 ? filteredResults : [...this.allData];
    }
    this.totalRecords = this.table2.length;
    this.requestSearch.pageNumber = 1;
  }

  // ✅ SORT
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
      if (valA < valB) return this.isAsc ? -1 : 1;
      if (valA > valB) return this.isAsc ? 1 : -1;
      return 0;
    });
  }

  onPageSizeChange(event: any) {
    this.requestSearch.pageSize = parseInt(event.target.value, 10);
    this.requestSearch.pageNumber = 1; // Reset to page 1
  }

  onBack() {
    window.history.back();
  }
}