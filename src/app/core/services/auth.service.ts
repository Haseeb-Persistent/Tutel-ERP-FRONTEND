// auth.service.ts
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  RefreshTokenRequest,
  User,
  ApiResponse
} from '../models/auth.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private authReadySubject = new BehaviorSubject<boolean>(false);
  public authReady$ = this.authReadySubject.asObservable();
  
  private accessTokenKey = 'access_token';
  private refreshTokenKey = 'refresh_token';
  private userKey = 'user';
  private platformId = inject(PLATFORM_ID);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    if (this.isBrowser) {
      this.loadStoredUser();
    }
    this.authReadySubject.next(true);
  }

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private loadStoredUser(): void {
    const token = this.getAccessToken();
    const userJson = this.getItem(this.userKey);

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        this.currentUserSubject.next(user);
      } catch (error) {
        this.clearStorage();
        this.currentUserSubject.next(null);
      }
    }
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, request)
      .pipe(
        tap(response => {
          if (response.responseCode === 0 && response.data) {
            this.handleAuthResponse(response.data);
          }
        }),
        catchError(this.handleError)
      );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, request)
      .pipe(
        tap(response => {
          if (response.responseCode === 0 && response.data) {
            this.handleAuthResponse(response.data);
          }
        }),
        catchError(this.handleError)
      );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const request: RefreshTokenRequest = { refreshToken };
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/refresh-token`, request)
      .pipe(
        tap(response => {
          if (response.responseCode === 0 && response.data) {
            this.handleAuthResponse(response.data);
          }
        }),
        catchError(this.handleError)
      );
  }

  logout(): Observable<any> {
    const token = this.getAccessToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.post(`${this.apiUrl}/auth/logout`, {}, { headers })
      .pipe(
        tap(() => {
          this.clearStorage();
          this.currentUserSubject.next(null);
          this.router.navigate(['/login']);
        }),
        catchError((error) => {
          // Even if logout fails on server, clear local storage
          this.clearStorage();
          this.currentUserSubject.next(null);
          this.router.navigate(['/login']);
          return throwError(() => error);
        })
      );
  }

  revokeAllTokens(): Observable<any> {
    const token = this.getAccessToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.post(`${this.apiUrl}/auth/revoke-all`, {}, { headers })
      .pipe(
        tap(() => {
          this.clearStorage();
          this.currentUserSubject.next(null);
          this.router.navigate(['/login']);
        }),
        catchError(this.handleError)
      );
  }

  private handleAuthResponse(data: any): void {
    if (data.accessToken) {
      this.setItem(this.accessTokenKey, data.accessToken);
    }
    if (data.refreshToken) {
      this.setItem(this.refreshTokenKey, data.refreshToken);
    }
    if (data.user) {
      this.setItem(this.userKey, JSON.stringify(data.user));
      this.currentUserSubject.next(data.user);
    }
  }

  private clearStorage(): void {
    this.removeItem(this.accessTokenKey);
    this.removeItem(this.refreshTokenKey);
    this.removeItem(this.userKey);
  }

  getAccessToken(): string | null {
    return this.getItem(this.accessTokenKey);
  }

  getRefreshToken(): string | null {
    return this.getItem(this.refreshTokenKey);
  }

  private getItem(key: string): string | null {
    return this.isBrowser ? localStorage.getItem(key) : null;
  }

  private setItem(key: string, value: string): void {
    if (this.isBrowser) {
      localStorage.setItem(key, value);
    }
  }

  private removeItem(key: string): void {
    if (this.isBrowser) {
      localStorage.removeItem(key);
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    const token = this.getAccessToken();
    const user = this.currentUserSubject.value;
    return !!token && !!user;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }

  private handleError(error: any): Observable<never> {
    console.error('Auth error:', error);
    
    // Don't try to refresh token for login/register endpoints
    // Just pass the error through
    return throwError(() => error);
  }
}