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
  },
    {
    path: 'location/city',
    loadComponent: () => import('./erp-city/erp-city.component')
      .then(m => m.ErpCityComponent)
  },
    {
    path: 'location/area',
    loadComponent: () => import('./erp-area/erp-area.component')
      .then(m => m.ErpAreaComponent)
  }
];