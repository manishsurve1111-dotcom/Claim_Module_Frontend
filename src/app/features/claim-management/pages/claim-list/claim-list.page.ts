import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ClaimService } from '../../services/claim.service';
import { ClaimResponse } from '../../model/claim.model';

@Component({
  selector: 'app-claim-list-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    CurrencyPipe,
    DatePipe,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './claim-list.page.html',
  styleUrl: './claim-list.page.css'
})
export class ClaimListPage implements OnInit {
  private claimService = inject(ClaimService);

  claims: ClaimResponse[] = [];
  filteredClaims: ClaimResponse[] = [];
  loading = true;
  error = '';

  searchQuery = '';
  selectedType = '';
  selectedStatus = '';

  displayedColumns: string[] = [
    'claimId',
    'claimNumber',
    'policyId',
    'customerId',
    'claimType',
    'estimatedLoss',
    'incidentDate',
    'claimStatus',
    'actions'
  ];

  claimTypes: string[] = ['ALL', 'HEALTH', 'LIFE', 'VEHICLE'];
  claimStatuses: string[] = [
    'ALL',
    'REGISTERED',
    'PENDING_VERIFICATION',
    'UNDER_SURVEY',
    'UNDER_INVESTIGATION',
    'INVESTIGATION_COMPLETED',
    'ASSESSED',
    'PENDING_APPROVAL',
    'APPROVED',
    'REJECTED',
    'PENDING_SETTLEMENT',
    'SETTLED'
  ];

  ngOnInit(): void {
    this.loadClaims();
  }

  loadClaims(): void {
    this.loading = true;
    this.error = '';

    this.claimService.getAllClaims().subscribe({
      next: (response) => {
        this.claims = response.data || [];
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to fetch claims list from the backend.';
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    let result = [...this.claims];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(c =>
        (c.claimNumber && c.claimNumber.toLowerCase().includes(q)) ||
        (c.policyId && c.policyId.toString().includes(q)) ||
        (c.customerId && c.customerId.toString().includes(q)) ||
        (c.claimId && c.claimId.toString().includes(q))
      );
    }

    if (this.selectedType && this.selectedType !== 'ALL') {
      result = result.filter(c => c.claimType === this.selectedType);
    }

    if (this.selectedStatus && this.selectedStatus !== 'ALL') {
      result = result.filter(c => c.claimStatus === this.selectedStatus);
    }

    this.filteredClaims = result;
  }

  resetFilter(): void {
    this.searchQuery = '';
    this.selectedType = '';
    this.selectedStatus = '';
    this.applyFilter();
  }

  getStatusClass(status: string): string {
    return (status || '').toLowerCase().replace(/_/g, '-');
  }
}
