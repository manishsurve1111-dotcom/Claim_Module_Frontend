import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { ClaimService } from '../../services/claim.service';
import { ApprovalService } from '../../../claim-approval/services/approval.service';
import { ClaimResponse } from '../../model/claim.model';

@Component({
  selector: 'app-claim-details-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CurrencyPipe,
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatCardModule
  ],
  templateUrl: './claim-details.page.html',
  styleUrl: './claim-details.page.css'
})
export class ClaimDetailsPage implements OnInit {
  private route = inject(ActivatedRoute);
  private claimService = inject(ClaimService);
  private approvalService = inject(ApprovalService);

  claimId!: number;
  claim: ClaimResponse | null = null;
  rejectionReason = '';
  loading = true;
  error = '';

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.claimId = Number(idParam);
      this.loadClaim();
    } else {
      this.error = 'Invalid claim ID provided in route.';
      this.loading = false;
    }
  }

  loadClaim(): void {
    this.loading = true;
    this.error = '';

    this.claimService.getClaimById(this.claimId).subscribe({
      next: (res) => {
        this.claim = res.data;
        this.loading = false;
        // Check approval list for rejection reason if applicable
        if (this.claim?.claimStatus === 'REJECTED') {
          this.fetchRejectionReason();
        }
      },
      error: (err) => {
        this.error = err.error?.message || `Claim with ID ${this.claimId} was not found.`;
        this.loading = false;
      }
    });
  }

  fetchRejectionReason(): void {
    this.approvalService.getAllClaims().subscribe({
      next: (approvals) => {
        const match = approvals.find(a => a.claimId === this.claimId);
        if (match && match.reason) {
          this.rejectionReason = match.reason;
        }
      },
      error: () => {
        // Non-critical, ignore
      }
    });
  }

  getStatusClass(status: string): string {
    return (status || '').toLowerCase().replace(/_/g, '-');
  }
}
