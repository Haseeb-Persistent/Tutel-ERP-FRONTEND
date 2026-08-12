import { Routes } from '@angular/router';

export const LocationRoute: Routes = [
  {
    path: 'location/country',
    loadComponent: () => import('./erp-country/erp-country.component')
      .then(m => m.ErpCountryComponent)
  },
    {
    path: 'location/province',
    loadComponent: () => import('./erp-province/erp-province.component')
      .then(m => m.ErpProvinceComponent)
  }
];