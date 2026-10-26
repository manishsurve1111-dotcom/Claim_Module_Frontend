import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { ClaimService } from '../../services/claim.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ClaimRequest, ClaimResponse, ClaimType } from '../../model/claim.model';

@Component({
  selector: 'app-register-claim-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule
  ],
  templateUrl: './register-claim.page.html',
  styleUrl: './register-claim.page.css'
})
export class RegisterClaimPage implements OnInit {
  private fb = inject(FormBuilder);
  private claimService = inject(ClaimService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  claimForm!: FormGroup;
  claimTypes: ClaimType[] = ['HEALTH', 'LIFE', 'VEHICLE'];

  submitting = false;
  checkingEligibility = false;
  eligibilityResult: { eligible: boolean; message: string; errors?: string[] } | null = null;

  errorMessage = '';
  registeredClaim: ClaimResponse | null = null;

  // Today's date in YYYY-MM-DD for max date restriction
  today = new Date().toISOString().slice(0, 10);

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.claimForm = this.fb.group({
      policyId: [null, [Validators.required, Validators.min(1)]],
      customerId: [null, [Validators.required, Validators.min(1)]],
      customerEmail: ['', [Validators.email]],
      claimType: ['HEALTH', [Validators.required]],
      incidentDate: [this.today, [Validators.required]],
      estimatedLoss: [null, [Validators.required, Validators.min(0.01)]]
    });
  }

  checkEligibility(): void {
    if (this.claimForm.invalid) {
      this.claimForm.markAllAsTouched();
      this.notificationService.warning('Please enter valid policy, customer, date and loss details to check eligibility.');
      return;
    }

    const val = this.claimForm.value;
    this.checkingEligibility = true;
    this.eligibilityResult = null;
    this.errorMessage = '';

    this.claimService.checkEligibility(
      Number(val.policyId),
      Number(val.customerId),
      val.incidentDate,
      val.claimType,
      Number(val.estimatedLoss)
    ).subscribe({
      next: (res) => {
        this.checkingEligibility = false;
        if (res.data?.eligible) {
          this.eligibilityResult = {
            eligible: true,
            message: 'Claim is eligible according to policy verification.'
          };
          this.notificationService.success('Policy is eligible for this claim!');
        } else {
          this.eligibilityResult = {
            eligible: false,
            message: 'Policy eligibility check returned issues:',
            errors: res.data?.errors || []
          };
          this.notificationService.warning('Policy is not currently eligible.');
        }
      },
      error: (err) => {
        this.checkingEligibility = false;
        const msg = err.error?.message || 'Could not verify eligibility with Policy/Premium service.';
        this.eligibilityResult = {
          eligible: false,
          message: msg
        };
      }
    });
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.registeredClaim = null;

    if (this.claimForm.invalid) {
      this.claimForm.markAllAsTouched();
      return;
    }

    const formVal = this.claimForm.value;
    const request: ClaimRequest = {
      policyId: Number(formVal.policyId),
      customerId: Number(formVal.customerId),
      customerEmail: formVal.customerEmail ? formVal.customerEmail.trim() : undefined,
      claimType: formVal.claimType,
      incidentDate: formVal.incidentDate,
      estimatedLoss: Number(formVal.estimatedLoss)
    };

    this.submitting = true;

    this.claimService.registerClaim(request).subscribe({
      next: (response) => {
        this.submitting = false;
        this.registeredClaim = response.data;
        this.notificationService.success(`Claim ${response.data?.claimNumber} registered successfully!`);
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err.error?.message || 'Failed to register claim. Please review the details.';
        this.notificationService.error(this.errorMessage);
      }
    });
  }

  resetForm(): void {
    this.claimForm.reset({
      claimType: 'HEALTH',
      incidentDate: this.today
    });
    this.registeredClaim = null;
    this.errorMessage = '';
    this.eligibilityResult = null;
  }
}
