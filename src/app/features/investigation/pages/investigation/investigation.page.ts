import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InvestigationService } from '../../services/investigation.service';
import { ClaimService } from '../../../claim-management/services/claim.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { InvestigationResponse } from '../../model/investigation.model';
import { ClaimResponse } from '../../../claim-management/model/claim.model';

@Component({
  selector: 'app-investigation-page',
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
  templateUrl: './investigation.page.html',
  styleUrl: './investigation.page.css'
})
export class InvestigationPage implements OnInit {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private investigationService = inject(InvestigationService);
  private claimService = inject(ClaimService);
  private notificationService = inject(NotificationService);

  claimId: number | null = null;
  claim: ClaimResponse | null = null;
  allClaims: ClaimResponse[] = [];

  investigations: InvestigationResponse[] = [];
  loading = false;
  starting = false;
  submittingReport = false;
  error = '';

  startForm!: FormGroup;
  reportForm!: FormGroup;
  activeInvestigationForReport: InvestigationResponse | null = null;

  displayedColumns: string[] = [
    'investigationId',
    'investigatorId',
    'investigationReason',
    'investigationStatus',
    'reportPath',
    'actions'
  ];

  ngOnInit(): void {
    this.initForms();

    const paramId = this.route.snapshot.paramMap.get('id');
    if (paramId) {
      this.claimId = Number(paramId);
      this.loadClaimAndInvestigations();
    } else {
      this.loadAllClaims();
    }
  }

  initForms(): void {
    this.startForm = this.fb.group({
      investigatorId: [null, [Validators.required, Validators.min(1)]],
      investigationReason: ['', [Validators.required, Validators.minLength(5)]]
    });

    this.reportForm = this.fb.group({
      reportPath: ['', [Validators.required]]
    });
  }

  loadAllClaims(): void {
    this.claimService.getAllClaims().subscribe({
      next: (res) => {
        this.allClaims = res.data || [];
        if (this.allClaims.length > 0 && !this.claimId) {
          this.claimId = this.allClaims[0].claimId;
          this.loadClaimAndInvestigations();
        }
      },
      error: () => {}
    });
  }

  onClaimSelected(): void {
    if (this.claimId) {
      this.loadClaimAndInvestigations();
    }
  }

  loadClaimAndInvestigations(): void {
    if (!this.claimId) return;

    this.loading = true;
    this.error = '';

    this.claimService.getClaimById(this.claimId).subscribe({
      next: (res) => {
        this.claim = res.data;
      },
      error: () => {}
    });

    this.investigationService.getInvestigations(this.claimId).subscribe({
      next: (res) => {
        this.investigations = res.data || [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to load investigations for this claim.';
      }
    });
  }

  onStartInvestigation(): void {
    if (!this.claimId) {
      this.notificationService.error('Please select a claim first.');
      return;
    }

    if (this.startForm.invalid) {
      this.startForm.markAllAsTouched();
      return;
    }

    const val = this.startForm.value;
    this.starting = true;

    this.investigationService.startInvestigation(this.claimId, {
      investigatorId: Number(val.investigatorId),
      investigationReason: val.investigationReason.trim()
    }).subscribe({
      next: () => {
        this.starting = false;
        this.notificationService.success('Investigation started successfully!');
        this.startForm.reset({ investigatorId: null });
        this.loadClaimAndInvestigations();
      },
      error: (err) => {
        this.starting = false;
        this.notificationService.error(
          err.error?.message || 'Failed to start investigation.'
        );
      }
    });
  }

  openReportModal(inv: InvestigationResponse): void {
    this.activeInvestigationForReport = inv;
    this.reportForm.reset({
      reportPath: `uploads/reports/investigation_report_${inv.investigationId}.pdf`
    });
  }

  cancelReport(): void {
    this.activeInvestigationForReport = null;
  }

  onSubmitReport(): void {
    if (!this.claimId || !this.activeInvestigationForReport) return;

    if (this.reportForm.invalid) {
      this.reportForm.markAllAsTouched();
      return;
    }

    const path = this.reportForm.value.reportPath.trim();
    this.submittingReport = true;

    this.investigationService.submitReport(
      this.claimId,
      this.activeInvestigationForReport.investigationId,
      path
    ).subscribe({
      next: () => {
        this.submittingReport = false;
        this.notificationService.success('Investigation report submitted; claim moved to INVESTIGATION_COMPLETED.');
        this.cancelReport();
        this.loadClaimAndInvestigations();
      },
      error: (err) => {
        this.submittingReport = false;
        this.notificationService.error(err.error?.message || 'Failed to submit report.');
      }
    });
  }

  getStatusClass(status: string): string {
    return (status || '').toLowerCase().replace(/_/g, '-');
  }
}
