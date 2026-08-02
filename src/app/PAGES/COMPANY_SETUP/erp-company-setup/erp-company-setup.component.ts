import { Component, OnInit } from '@angular/core';
import { LimitInputDirective } from "../../../shared/directive/limit-input";
import { cnicFormat } from '../../../shared/directive/cnicFormat';
import { CrudButton } from "../../../shared/components/crud-button/crud-button";
import { ActivatedRoute, RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-erp-company-setup',
  standalone: true,
  templateUrl: './erp-company-setup.component.html',
  imports: [LimitInputDirective, cnicFormat, CrudButton,RouterOutlet],
})
export class ErpCompanySetupComponent implements OnInit {
  constructor(  private _activatedRoute: ActivatedRoute,
) { }
  formId: string = '';
  headerTitle: string = '';

  ngOnInit() {
    // Subscribe to query params like your template
    this._activatedRoute.queryParams.subscribe(params => {
      this.formId = params['f'] || '';        // 'f' is formId
      this.headerTitle = params['formTitle'];
    });
  }


}
