import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';

import { ErpSidebarComponent } from './Layout/erp-sidebar/erp-sidebar.component';
import { ErpHeaderComponent } from './Layout/erp-header/erp-header.component';
import { MainLayoutComponent } from "./Layout/main-layout/main-layout.component";
import { LoaderComponent } from "./shared/components/loader/loader.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    LoaderComponent
],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('ERP-Front');
}