import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  importProvidersFrom // Add this import
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { NgxUiLoaderModule } from 'ngx-ui-loader'; // Import the module

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    
    // HTTP Client
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    ),
    
    // NGX UI Loader - Use importProvidersFrom instead
    importProvidersFrom(
      NgxUiLoaderModule.forRoot({
        bgsColor: '#3f51b5',
        bgsOpacity: 0.5,
        bgsSize: 60,
        bgsType: 'ball-spin-clockwise',
        blur: 8,
        delay: 0,
        fastFadeOut: true,
        fgsColor: '#3e57e9',
        fgsType: 'ball-spin-clockwise',
        gap: 24,
        logoUrl: '',
        masterLoaderId: 'master',
        overlayBorderRadius: '0',
        overlayColor: 'rgba(40, 40, 40, 0.8)',
        pbColor: '#3f51b5',
        pbDirection: 'ltr',
        pbThickness: 3,
        hasProgressBar: true,
        text: '',
        textColor: '#FFFFFF',
        maxTime: -1
      })
    )
  ]
};