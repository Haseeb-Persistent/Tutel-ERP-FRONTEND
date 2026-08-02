import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (this.authService.isLoggedIn()) {
          // Check for role-based access
          const requiredRoles = route.data['roles'] as string[];
          if (requiredRoles && requiredRoles.length > 0) {
            const userRole = user?.role || 'User';
            if (!requiredRoles.includes(userRole)) {
              this.router.navigate(['/dashboard']);
              return false;
            }
          }
          return true;
        }
        
        // Store the attempted URL for redirecting after login
        this.router.navigate(['/login'], { 
          queryParams: { returnUrl: state.url } 
        });
        return false;
      })
    );
  }
}