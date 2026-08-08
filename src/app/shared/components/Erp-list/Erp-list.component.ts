import { Component, signal, OnInit, OnChanges, SimpleChanges } from '@angular/core';
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
export class ErpList implements OnInit, OnChanges { // ✅ Add OnChanges
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
    pageSize: 50,
    keyword: '',
  };

  gridHeaders = signal<string[]>([]);
  gridColumns = signal<string[]>([]);

  // ✅ Store the subscription so we can clean it up
  private paramSubscription: any;
  private querySubscription: any;

  constructor(
    private gridService: GridService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService
  ) { }

  ngOnInit() {
    // ✅ Subscribe to route changes once in ngOnInit
    this.paramSubscription = this.activatedRoute.paramMap.subscribe((params) => {
      this.formName = params.get('formName') || 'Country';
      this.formId = this.formName;
      
      // ✅ IMPORTANT: Fetch data immediately whenever the param changes!
      this.loadPageData();
    });

    this.querySubscription = this.activatedRoute.queryParams.subscribe((params) => {
      this.formTitle = params['formTitle'] || `${this.formName} Setup`;
      const dynamicRoute = params['formRoute'] || '/location/country';

      this.table1 = {
        insert_allowed: 1,
        link_form: dynamicRoute,
        form_id: this.formId
      };
      this.Route = this.table1.link_form;
      this.isAddNewVisible = true;
    });
  }

  // ✅ Add ngOnChanges to detect when the route parameter changes
  ngOnChanges(changes: SimpleChanges) {
    // If formName changes, reload data
    if (changes['formName'] && !changes['formName'].firstChange) {
      this.loadPageData();
    }
  }

  // ✅ New method to handle data fetching
  loadPageData() {
    // Clear old data to prevent showing stale data
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
          link_form: this.Route || '/location/country',
          form_id: this.formId
        };
        this.isAddNewVisible = true;

        const allRows = res || [];
        this.allData = allRows;

        // Dynamically generate columns
        if (allRows.length > 0) {
          const hideThese = ['rowid', 'Maker', 'Maker Date', 'Authorizer', 'Authorizer Date', 'RCSTATUS'];
          const allKeys = Object.keys(allRows[0]);
          this.gridColumns.set(allKeys.filter(key => !hideThese.includes(key)));
          this.gridHeaders.set([...this.gridColumns()]);
        }

        this.table2 = allRows;
        this.totalRecords = this.table2.length;
      },
      error: (err) => {
        const Message = err?.error?.message || 'Error loading data';
        this.dialogService.alertBox(Message);
      }
    });
  }

  // ✅ Clean up subscriptions when component is destroyed
  ngOnDestroy() {
    if (this.paramSubscription) this.paramSubscription.unsubscribe();
    if (this.querySubscription) this.querySubscription.unsubscribe();
  }

  addNewSetup() {
    this.router.navigate([`/app/${this.Route}`], {
      queryParams: { f: this.formName, formTitle: this.formTitle }
    });
  }

  onRowClick(RowID: string) {
    this.router.navigate([`/app/${this.Route}`], {
      queryParams: { f: this.formName, id: RowID, formTitle: this.formTitle }
    });
  }

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

  onBack() {
    window.history.back();
  }
}