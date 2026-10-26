import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
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
import { SurveyService } from '../../services/survey.service';
import { ClaimService } from '../../../claim-management/services/claim.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { SurveyAssignmentResponse } from '../../model/survey.model';
import { ClaimResponse } from '../../../claim-management/model/claim.model';

@Component({
  selector: 'app-survey-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
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
  templateUrl: './survey.page.html',
  styleUrl: './survey.page.css'
})
export class SurveyPage implements OnInit {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private surveyService = inject(SurveyService);
  private claimService = inject(ClaimService);
  private notificationService = inject(NotificationService);

  claimId: number | null = null;
  claim: ClaimResponse | null = null;
  allClaims: ClaimResponse[] = [];

  surveys: SurveyAssignmentResponse[] = [];
  loading = false;
  assigning = false;
  submittingReport = false;
  error = '';

  assignForm!: FormGroup;
  reportForm!: FormGroup;
  activeSurveyForReport: SurveyAssignmentResponse | null = null;

  displayedColumns: string[] = [
    'surveyId',
    'surveyorId',
    'assignedDate',
    'inspectionDate',
    'surveyStatus',
    'reportPath',
    'actions'
  ];

  ngOnInit(): void {
    this.initForms();

    const paramId = this.route.snapshot.paramMap.get('id');
    if (paramId) {
      this.claimId = Number(paramId);
      this.loadClaimAndSurveys();
    } else {
      this.loadAllClaims();
    }
  }

  initForms(): void {
    // Tomorrow as default inspection date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const defaultDateStr = tomorrow.toISOString().slice(0, 16);

    this.assignForm = this.fb.group({
      surveyorId: [null, [Validators.required, Validators.min(1)]],
      inspectionDate: [defaultDateStr, [Validators.required]]
    });

    this.reportForm = this.fb.group({
      damageDescription: ['', [Validators.required]],
      assessedDamageAmount: [null, [Validators.required, Validators.min(0)]],
      surveyorRemarks: [''],
      recommendation: ['', [Validators.required]]
    });
  }

  loadAllClaims(): void {
    this.claimService.getAllClaims().subscribe({
      next: (res) => {
        this.allClaims = res.data || [];
        if (this.allClaims.length > 0 && !this.claimId) {
          this.claimId = this.allClaims[0].claimId;
          this.loadClaimAndSurveys();
        }
      },
      error: () => {}
    });
  }

  onClaimSelected(): void {
    if (this.claimId) {
      this.loadClaimAndSurveys();
    }
  }

  loadClaimAndSurveys(): void {
    if (!this.claimId) return;

    this.loading = true;
    this.error = '';

    this.claimService.getClaimById(this.claimId).subscribe({
      next: (res) => {
        this.claim = res.data;
      },
      error: () => {}
    });

    this.surveyService.getAssignments(this.claimId).subscribe({
      next: (data) => {
        this.surveys = data || [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to load surveys for this claim.';
      }
    });
  }

  onAssignSurveyor(): void {
    if (!this.claimId) {
      this.notificationService.error('Please select a claim first.');
      return;
    }

    if (this.assignForm.invalid) {
      this.assignForm.markAllAsTouched();
      return;
    }

    const val = this.assignForm.value;
    this.assigning = true;

    this.surveyService.assignSurveyor(this.claimId, {
      surveyorId: Number(val.surveyorId),
      inspectionDate: val.inspectionDate
    }).subscribe({
      next: () => {
        this.assigning = false;
        this.notificationService.success('Surveyor assigned successfully!');
        this.assignForm.reset({ surveyorId: null });
        this.loadClaimAndSurveys();
      },
      error: (err) => {
        this.assigning = false;
        this.notificationService.error(
          err.error?.message || 'Failed to assign surveyor. Check threshold conditions.'
        );
      }
    });
  }

  openReportModal(survey: SurveyAssignmentResponse): void {
    this.activeSurveyForReport = survey;
    this.reportForm.reset({
      damageDescription: '',
      assessedDamageAmount: this.claim?.estimatedLoss || null,
      surveyorRemarks: '',
      recommendation: 'Recommend claim approval subject to policy deductibles.'
    });
  }

  cancelReport(): void {
    this.activeSurveyForReport = null;
  }

  onSubmitReport(): void {
    if (!this.claimId || !this.activeSurveyForReport) return;

    if (this.reportForm.invalid) {
      this.reportForm.markAllAsTouched();
      return;
    }

    const val = this.reportForm.value;
    this.submittingReport = true;

    this.surveyService.submitSurveyReport(this.claimId, this.activeSurveyForReport.surveyId, {
      damageDescription: val.damageDescription.trim(),
      assessedDamageAmount: Number(val.assessedDamageAmount),
      surveyorRemarks: val.surveyorRemarks ? val.surveyorRemarks.trim() : undefined,
      recommendation: val.recommendation.trim()
    }).subscribe({
      next: (res) => {
        this.submittingReport = false;
        this.notificationService.success('Survey findings submitted and PDF generated!');
        this.cancelReport();
        this.loadClaimAndSurveys();
      },
      error: (err) => {
        this.submittingReport = false;
        this.notificationService.error(err.error?.message || 'Failed to submit survey report.');
      }
    });
  }

  getStatusClass(status: string): string {
    return (status || '').toLowerCase().replace(/_/g, '-');
  }
}
