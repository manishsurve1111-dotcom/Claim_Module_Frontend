import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  success(message: string, duration = 4000): void {
    this.snackBar.open(message, 'Close', {
      duration,
      panelClass: ['snackbar-success'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  error(message: string, duration = 6000): void {
    this.snackBar.open(message, 'Dismiss', {
      duration,
      panelClass: ['snackbar-error'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  warning(message: string, duration = 5000): void {
    this.snackBar.open(message, 'OK', {
      duration,
      panelClass: ['snackbar-warning'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  info(message: string, duration = 4000): void {
    this.snackBar.open(message, 'OK', {
      duration,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }
}
