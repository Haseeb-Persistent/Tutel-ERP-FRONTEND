// app.routes.ts
import { Router, Routes } from '@angular/router';
import { ErpLoginComponent } from './PAGES/Authentication/erp-login/erp-login.component';
import { MainLayoutComponent } from './Layout/main-layout/main-layout.component';
import { AuthGuard } from './core/guards/auth.guard';
import { inject } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { filter, map, take } from 'rxjs';
import { CompanyRoute } from './PAGES/COMPANY_SETUP/erp-company-setup/Company.route';

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

      // Feature Modules - ADD THIS BEFORE WILDCARD
      ...CompanyRoute,

      // Default empty content area
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      // 404 - Page Not Found
      {
        path: 'pageNotFound',
        loadComponent: () => import('./shared/components/not-found/not-found.component')
          .then(m => m.NotFoundComponent)
      },

      // Wildcard - redirect to 404 (MUST BE LAST)
      { path: '**', redirectTo: 'pageNotFound' }
    ]
  },

  // Old dashboard path redirect (for backward compatibility)
  {
    path: 'dashboard',
    redirectTo: 'app/dashboard',
    pathMatch: 'full'
  },

  // Catch all - redirect to dashboard
  { path: '**', redirectTo: 'app/dashboard' }
];