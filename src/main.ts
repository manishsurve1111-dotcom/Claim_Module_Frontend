
import 'zone.js';

import { bootstrapApplication } from '@angular/platform-browser';
import {
  provideHttpClient,
  withInterceptors,
  withInterceptorsFromDi
} from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { errorInterceptor } from './app/core/interceptors/error.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([errorInterceptor]),
      withInterceptorsFromDi()
    ),
    provideAnimations()
  ]
}).catch(err => console.error(err));
