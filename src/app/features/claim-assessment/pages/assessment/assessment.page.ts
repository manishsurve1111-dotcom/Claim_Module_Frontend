import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { AssessmentService } from '../../services/assessment.service';
import { ClaimService } from '../../../claim-management/services/claim.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ClaimAssessmentResponse } from '../../model/assessment.model';
import { ClaimResponse } from '../../../claim-management/model/claim.model';

@Component({
  selector: 'app-assessment-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    CurrencyPipe,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatCardModule
  ],
  templateUrl: './assessment.page.html',
  styleUrl: './assessment.page.css'
})
export class AssessmentPage implements OnInit {
  private route = inject(ActivatedRoute);
  private assessmentService = inject(AssessmentService);
  private claimService = inject(ClaimService);
  private notificationService = inject(NotificationService);

  claimId: number | null = null;
  claim: ClaimResponse | null = null;
  allClaims: ClaimResponse[] = [];

  assessments: ClaimAssessmentResponse[] = [];
  latestAssessment: ClaimAssessmentResponse | null = null;

  loading = false;
  creating = false;
  error = '';

  displayedColumns: string[] = [
    'assessmentId',
    'assessedAmount',
    'deductible',
    'depreciation',
    'nonPayable',
    'netPayable'
  ];

  ngOnInit(): void {
    const paramId = this.route.snapshot.paramMap.get('id');
    if (paramId) {
      this.claimId = Number(paramId);
      this.loadClaimAndAssessments();
    } else {
      this.loadAllClaims();
    }
  }

  loadAllClaims(): void {
    this.claimService.getAllClaims().subscribe({
      next: (res) => {
        this.allClaims = res.data || [];
        if (this.allClaims.length > 0 && !this.claimId) {
          this.claimId = this.allClaims[0].claimId;
          this.loadClaimAndAssessments();
        }
      },
      error: () => {}
    });
  }

  onClaimSelected(): void {
    if (this.claimId) {
      this.loadClaimAndAssessments();
    }
  }

  loadClaimAndAssessments(): void {
    if (!this.claimId) return;

    this.loading = true;
    this.error = '';

    this.claimService.getClaimById(this.claimId).subscribe({
      next: (res) => {
        this.claim = res.data;
      },
      error: () => {}
    });

    this.assessmentService.getAssessments(this.claimId).subscribe({
      next: (data) => {
        this.assessments = data || [];
        this.latestAssessment = this.assessments.length > 0 ? this.assessments[this.assessments.length - 1] : null;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to load assessment details.';
      }
    });
  }

  onCreateAssessment(): void {
    if (!this.claimId) {
      this.notificationService.error('Please select a valid claim first.');
      return;
    }

    this.creating = true;

    this.assessmentService.createAssessment(this.claimId).subscribe({
      next: (assessment) => {
        this.creating = false;
        this.latestAssessment = assessment;
        this.notificationService.success(
          `Assessment created! Net payable: ₹${assessment.netPayable}. Claim moved to PENDING_APPROVAL.`
        );
        this.loadClaimAndAssessments();
      },
      error: (err) => {
        this.creating = false;
        const msg = err.error?.message || 'Assessment failed. Make sure all documents are verified and no active surveys/investigations are ongoing.';
        this.notificationService.error(msg);
      }
    });
  }

  getStatusClass(status: string): string {
    return (status || '').toLowerCase().replace(/_/g, '-');
  }
}
