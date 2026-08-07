// app.routes.ts
import { Router, Routes } from '@angular/router';
import { ErpLoginComponent } from './PAGES/Authentication/erp-login/erp-login.component';
import { MainLayoutComponent } from './Layout/main-layout/main-layout.component';
import { AuthGuard } from './core/guards/auth.guard';
import { inject } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { filter, map, take } from 'rxjs';
import { CompanyRoute } from './PAGES/COMPANY_SETUP/erp-company-setup/Company.route';
import { UserRoute } from './PAGES/USER_SETUP/User.route';
import { LocationRoute } from './PAGES/Location-Setup/location.route';

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

  // Main App Layout with Sidebar & Header
  {
    path: 'app',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      // Dashboard Home
      {
        path: 'dashboard',
        loadComponent: () => import('./PAGES/erp-dashboard/erp-dashboard.component')
          .then(m => m.ErpDashboardComponent)
      },
      ...CompanyRoute,
      ...UserRoute,
      ...LocationRoute,
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