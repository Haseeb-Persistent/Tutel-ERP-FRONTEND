import { Component, OnInit } from '@angular/core';
import { AlertModalComponent } from "../../shared/components/alert-modal/alert-modal.component";
import { ErpHeaderComponent } from "../erp-header/erp-header.component";
import { ErpSidebarComponent } from "../erp-sidebar/erp-sidebar.component";
import { RouterModule } from "@angular/router";
import { ErpDashboardComponent } from "../../PAGES/erp-dashboard/erp-dashboard.component";
import { LoaderComponent } from "../../shared/components/loader/loader.component";

@Component({
  selector: 'app-main-layout',
  standalone:true,
  templateUrl: './main-layout.component.html',
  imports: [ErpHeaderComponent, ErpSidebarComponent, RouterModule, ErpDashboardComponent, LoaderComponent]
})
export class MainLayoutComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
