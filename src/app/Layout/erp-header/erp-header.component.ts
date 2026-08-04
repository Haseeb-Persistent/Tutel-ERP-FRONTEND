// erp-header.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-erp-header',
  templateUrl: './erp-header.component.html',
  styleUrls: ['./erp-header.component.css']
})
export class ErpHeaderComponent implements OnInit {

  constructor(private _activatedRoute: ActivatedRoute, private authService: AuthService,
  ) { }

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
    this.authService.logout().subscribe({
      next: () => { 
        console.log('Logout successful');
      },
      error: (error) => {
        console.error('Logout error:', error);
      }
    });
  }
}