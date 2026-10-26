import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApprovalService } from '../../services/approval.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ClaimApprovalResponse } from '../../model/approval.model';

@Component({
  selector: 'app-claim-approval-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './claim-approval.page.html',
  styleUrl: './claim-approval.page.css'
})
export class ClaimApprovalPage implements OnInit {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private approvalService = inject(ApprovalService);
  private notificationService = inject(NotificationService);

  claims: ClaimApprovalResponse[] = [];
  filteredClaims: ClaimApprovalResponse[] = [];
  loading = true;
  submitting = false;
  error = '';

  filterStatus = 'ALL';
  statuses: string[] = ['ALL', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'];

  targetClaimId: number | null = null;
  selectedClaimForDecision: ClaimApprovalResponse | null = null;
  decisionForm!: FormGroup;

  displayedColumns: string[] = [
    'claimId',
    'claimNumber',
    'claimStatus',
    'reason',
    'actions'
  ];

  ngOnInit(): void {
    this.initForm();

    const paramId = this.route.snapshot.paramMap.get('id');
    if (paramId) {
      this.targetClaimId = Number(paramId);
    }

    this.loadClaims();
  }

  initForm(): void {
    this.decisionForm = this.fb.group({
      approved: [true, [Validators.required]],
      reason: ['']
    });

    // Dynamically adjust reason validator when rejecting
    this.decisionForm.get('approved')?.valueChanges.subscribe((approved: boolean) => {
      const reasonControl = this.decisionForm.get('reason');
      if (approved === false) {
        reasonControl?.setValidators([Validators.required, Validators.minLength(4)]);
      } else {
        reasonControl?.clearValidators();
      }
      reasonControl?.updateValueAndValidity();
    });
  }

  loadClaims(): void {
    this.loading = true;
    this.error = '';

    this.approvalService.getAllClaims().subscribe({
      next: (data) => {
        this.claims = data || [];
        this.applyFilter();
        this.loading = false;

        // If a specific claimId was requested in route, select it
        if (this.targetClaimId) {
          const match = this.claims.find(c => c.claimId === this.targetClaimId);
          if (match) {
            this.openDecisionPanel(match);
          }
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to fetch claims from approval service.';
      }
    });
  }

  applyFilter(): void {
    if (this.filterStatus === 'ALL') {
      this.filteredClaims = [...this.claims];
    } else {
      this.filteredClaims = this.claims.filter(c => c.claimStatus === this.filterStatus);
    }
  }

  openDecisionPanel(claim: ClaimApprovalResponse): void {
    this.selectedClaimForDecision = claim;
    this.decisionForm.reset({
      approved: true,
      reason: ''
    });
  }

  closeDecisionPanel(): void {
    this.selectedClaimForDecision = null;
    this.decisionForm.reset();
  }

  onSubmitDecision(): void {
    if (!this.selectedClaimForDecision) return;

    if (this.decisionForm.invalid) {
      this.decisionForm.markAllAsTouched();
      return;
    }

    const val = this.decisionForm.value;
    const isApproved = val.approved === true || val.approved === 'true';
    const reason = val.reason ? val.reason.trim() : undefined;

    if (!isApproved && (!reason || reason.trim().length === 0)) {
      this.notificationService.error('Rejection reason is required when rejecting a claim.');
      return;
    }

    this.submitting = true;

    this.approvalService.approveOrRejectClaim(this.selectedClaimForDecision.claimId, {
      approved: isApproved,
      reason
    }).subscribe({
      next: (res) => {
        this.submitting = false;
        this.notificationService.success(
          `Claim ${res.claimNumber} has been ${res.claimStatus} successfully!`
        );
        this.closeDecisionPanel();
        this.loadClaims();
      },
      error: (err) => {
        this.submitting = false;
        this.notificationService.error(
          err.error?.message || 'Approval operation failed. Only claims with PENDING_APPROVAL status can be decided.'
        );
      }
    });
  }

  getStatusClass(status: string): string {
    return (status || '').toLowerCase().replace(/_/g, '-');
  }
}
