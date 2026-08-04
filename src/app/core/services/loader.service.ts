// core/services/loader.service.ts (Enhanced)
import { Injectable } from '@angular/core';
import { NavigationStart, NavigationEnd, NavigationCancel, NavigationError, Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private requestCount = 0;
  private routeNavigationCount = 0;
  private routerSubscription: Subscription | null = null;

  constructor(private router: Router) {
    this.initRouteLoader();
  }

  private initRouteLoader() {
    // Show loader on navigation start
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationStart))
      .subscribe(() => {
        this.routeNavigationCount++;
        this.loadingSubject.next(true);
      });

    // Hide loader on navigation end, cancel, or error
    this.router.events
      .pipe(filter(event => 
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ))
      .subscribe(() => {
        this.routeNavigationCount--;
        if (this.routeNavigationCount <= 0) {
          this.routeNavigationCount = 0;
          this.checkAndHideLoader();
        }
      });
  }

  show() {
    this.requestCount++;
    this.loadingSubject.next(true);
  }

  hide() {
    this.requestCount--;
    if (this.requestCount <= 0) {
      this.requestCount = 0;
      this.checkAndHideLoader();
    }
  }

  private checkAndHideLoader() {
    // Only hide if both API requests and route navigation are complete
    if (this.requestCount <= 0 && this.routeNavigationCount <= 0) {
      this.loadingSubject.next(false);
    }
  }

  reset() {
    this.requestCount = 0;
    this.routeNavigationCount = 0;
    this.loadingSubject.next(false);
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}