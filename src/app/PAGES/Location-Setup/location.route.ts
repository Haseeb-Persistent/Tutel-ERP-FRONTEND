import { Routes } from '@angular/router';
import { ErpList } from '../../shared/components/Erp-list/Erp-list.component';

export const LocationRoute: Routes = [

     { 
    path: 'ErpList/:formName', 
    component: ErpList, 
  },
  {
    path: 'location/country',
    loadComponent: () => import('./erp-country/erp-country.component')
      .then(m => m.ErpCountryComponent)
  }
];