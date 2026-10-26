import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardStats } from '../../model/dashboard.model';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CurrencyPipe,
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.css'
})
export class DashboardPage implements OnInit {
  private dashboardService = inject(DashboardService);

  stats: DashboardStats | null = null;
  loading = true;
  error = '';
  displayedColumns: string[] = ['claimNumber', 'claimType', 'estimatedLoss', 'claimDate', 'claimStatus', 'actions'];

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.error = '';

    this.dashboardService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Could not load dashboard data from backend.';
        this.loading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    return (status || '').toLowerCase().replace(/_/g, '-');
  }

  getStatusKeys(): string[] {
    return this.stats?.statusCounts ? Object.keys(this.stats.statusCounts) : [];
  }
}
