import { Router, Routes } from '@angular/router';
import { ErpLoginComponent } from './COMPONENTS/Authentication/erp-login/erp-login.component';
import { MainLayoutComponent } from './Layout/main-layout/main-layout.component';
import { AuthGuard } from './core/guards/auth.guard';
import { inject } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { filter, map, take } from 'rxjs';
import { UserRoute } from './COMPONENTS/USER_SETUP/User.route';
import { LocationRoute } from './COMPONENTS/LOCATION_SETUP/location.route';
import { ErpList } from './shared/components/Erp-list/Erp-list.component';
import { CompanyRoute } from './COMPONENTS/COMPANY_SETUP/Company.route';

export const routes: Routes = [
  // Default redirect
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  // Login Page - Public
  {
    path: 'login',
    component: ErpLoginComponent,
    canActivate: [
      () => {
        const auth = inject(AuthService);
        const router = inject(Router);

        return auth.authReady$.pipe(
          filter(x => x),
          take(1),
          map(() => {
            if (auth.isLoggedIn()) {
              return router.createUrlTree(['/dashboard']);
            }
            return true;
          })
        );
      }
    ]
  },

  {
    path: 'app',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      // Dashboard
      {
        path: 'dashboard',
        loadComponent: () => import('./COMPONENTS/erp-dashboard/erp-dashboard.component')
          .then(m => m.ErpDashboardComponent)
      },
      
   { 
    path: 'ErpList/:formName', 
    component: ErpList 
  },

      ...LocationRoute,
      ...CompanyRoute,
      ...UserRoute,

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'pageNotFound',
        loadComponent: () => import('./shared/components/not-found/not-found.component')
          .then(m => m.NotFoundComponent)
      },
      { path: '**', redirectTo: 'pageNotFound' }
    ]
  },
  
  
  {
    path: 'dashboard',
    redirectTo: 'app/dashboard',
    pathMatch: 'full'
  },
  { path: '**', redirectTo: 'app/dashboard' }
];