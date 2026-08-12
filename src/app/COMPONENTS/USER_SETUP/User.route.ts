import { Routes } from '@angular/router';

export const UserRoute: Routes = [
  {
    path: 'user-setup/users',
    loadComponent: () => import('./erp-create-user/erp-create-user.component')
      .then(m => m.ErpCreateUserComponent),
  },
  
];