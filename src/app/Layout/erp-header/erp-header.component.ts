// erp-header.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-erp-header',
  templateUrl: './erp-header.component.html',
  styleUrls: ['./erp-header.component.css']
})
export class ErpHeaderComponent implements OnInit {

  constructor(private _activatedRoute: ActivatedRoute) { }

  formId: string = '';
  headerTitle: string = 'Dashboard';

  ngOnInit() {
    this._activatedRoute.queryParams.subscribe(params => {
      this.formId = params['f'] || '';
      this.headerTitle = params['formTitle'] || 'Dashboard';
    });
  }

  onBack() {
    window.history.back();
  }

  logout() {
    // Add your logout logic here
    console.log('Logout clicked');
  }
}