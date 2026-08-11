// auth.interceptor.ts
import {
  HttpInterceptorFn,
  HttpHandlerFn,
  HttpRequest,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, switchMap, throwError, from } from 'rxjs';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  // Skip token for auth endpoints
  const isAuthEndpoint =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/refresh-token');

  let authReq = req;

  if (token && !isAuthEndpoint) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Only handle 401 for non-auth endpoints
      if (error.status === 401 && !isAuthEndpoint) {
        return handle401Error(req, next, authService);
      }
      return throwError(() => error);
    })
  );
};

function handle401Error(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService
): Observable<HttpEvent<unknown>> {
  // Check if refresh token exists
  const refreshToken = authService.getRefreshToken();
  
  // If no refresh token, don't try to refresh
  if (!refreshToken) {
    authService.logout();
    return throwError(() => new Error('No refresh token available'));
    
  }

  if (!isRefreshing) {
    isRefreshing = true;

    return authService.refreshToken().pipe(
      switchMap((response: any) => {
        isRefreshing = false;

        const newToken = response?.data?.accessToken;

        if (newToken) {
          const newReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${newToken}`,
            },
          });

          return next(newReq);
        }

        authService.logout();
        return throwError(() => new Error('Failed to refresh token'));
      }),
      catchError((error: HttpErrorResponse) => {
        isRefreshing = false;
        authService.logout();
        return throwError(() => error);
      })
    );
  }

  return throwError(() => new Error('Token refresh already in progress'));
}