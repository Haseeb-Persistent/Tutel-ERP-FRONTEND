// PAGES/COMPANY_SETUP/Company.route.ts
import { Routes } from '@angular/router';

export const CompanyRoute: Routes = [
  {
    path: 'master-data/companies',
    loadComponent: () => import('./erp-company-setup.component')
      .then(m => m.ErpCompanySetupComponent)
  }
];