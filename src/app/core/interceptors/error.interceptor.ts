import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

/**
 * Global HTTP Error Interceptor that catches unhandled errors and
 * provides meaningful user-facing notifications.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected network error occurred.';

      if (error.error instanceof ErrorEvent) {
        // Client-side or network error
        errorMessage = `Network Error: ${error.error.message}`;
      } else {
        // Backend returned an unsuccessful response code
        if (error.status === 0) {
          errorMessage = 'Cannot reach backend server. Please check if Spring Boot is running on port 8081.';
        } else if (error.error && typeof error.error === 'object' && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.status === 400) {
          errorMessage = error.error?.message || 'Invalid request parameters or business validation failed.';
        } else if (error.status === 404) {
          errorMessage = error.error?.message || 'The requested resource was not found.';
        } else if (error.status === 409) {
          errorMessage = error.error?.message || 'Conflict: business state transition not permitted.';
        } else if (error.status === 500) {
          errorMessage = error.error?.message || 'Internal server error occurred on the backend.';
        } else if (error.status === 503) {
          errorMessage = error.error?.message || 'Service unavailable: external dependency failed.';
        }
      }

      console.error(`HTTP Error [${error.status}]:`, errorMessage, error);
      return throwError(() => error);
    })
  );
};
