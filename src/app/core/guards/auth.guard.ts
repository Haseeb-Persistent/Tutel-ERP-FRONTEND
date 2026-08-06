import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, switchMap, take } from 'rxjs/operators';
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
    
  return this.authService.authReady$.pipe(

  filter(ready => ready),

  take(1),

  switchMap(() => 
    this.authService.currentUser$.pipe(
      take(1),

      map(user => {


        if(this.authService.isLoggedIn())
        {

          const requiredRoles =
          route.data['roles'] as string[];


          if(requiredRoles?.length)
          {

            const userRole =
            user?.role || 'User';


            if(!requiredRoles.includes(userRole))
            {
              this.router.navigate(['/dashboard']);
              return false;
            }

          }


          return true;

        }


        return this.router.createUrlTree(
          ['/login'],
          {
            queryParams:{
              returnUrl:state.url
            }
          }
        );


      })

    )
  )

);
  }
}