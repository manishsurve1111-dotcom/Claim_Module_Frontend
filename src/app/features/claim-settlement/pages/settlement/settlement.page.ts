import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
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
import { MatCardModule } from '@angular/material/card';
import { SettlementService } from '../../services/settlement.service';
import { ClaimService } from '../../../claim-management/services/claim.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { PaymentMode, SettlementRequest, SettlementResponse } from '../../model/settlement.model';
import { ClaimResponse } from '../../../claim-management/model/claim.model';

@Component({
  selector: 'app-settlement-page',
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
    MatProgressSpinnerModule,
    MatCardModule
  ],
  templateUrl: './settlement.page.html',
  styleUrl: './settlement.page.css'
})
export class SettlementPage implements OnInit {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private settlementService = inject(SettlementService);
  private claimService = inject(ClaimService);
  private notificationService = inject(NotificationService);

  claimId: number | null = null;
  claim: ClaimResponse | null = null;
  allClaims: ClaimResponse[] = [];

  settlement: SettlementResponse | null = null;
  loading = false;
  submitting = false;
  error = '';

  settlementForm!: FormGroup;
  paymentModes: PaymentMode[] = ['NEFT', 'RTGS', 'IMPS', 'UPI', 'CHEQUE'];

  ngOnInit(): void {
    this.initForm();

    const paramId = this.route.snapshot.paramMap.get('id');
    if (paramId) {
      this.claimId = Number(paramId);
      this.loadClaimAndSettlement();
    } else {
      this.loadAllClaims();
    }
  }

  initForm(): void {
    this.settlementForm = this.fb.group({
      paymentMode: ['NEFT', [Validators.required]],
      bankAccountNumber: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(18)]],
      bankIfscCode: ['', [Validators.required, Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]],
      transactionReference: [''],
      remarks: ['']
    });
  }

  loadAllClaims(): void {
    this.claimService.getAllClaims().subscribe({
      next: (res) => {
        this.allClaims = res.data || [];
        if (this.allClaims.length > 0 && !this.claimId) {
          this.claimId = this.allClaims[0].claimId;
          this.loadClaimAndSettlement();
        }
      },
      error: () => {}
    });
  }

  onClaimSelected(): void {
    if (this.claimId) {
      this.loadClaimAndSettlement();
    }
  }

  loadClaimAndSettlement(): void {
    if (!this.claimId) return;

    this.loading = true;
    this.error = '';
    this.settlement = null;

    this.claimService.getClaimById(this.claimId).subscribe({
      next: (res) => {
        this.claim = res.data;
      },
      error: () => {}
    });

    this.settlementService.getSettlement(this.claimId).subscribe({
      next: (data) => {
        this.settlement = data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        // 404 or RuntimeException "Settlement not found" means settlement not created yet
        this.settlement = null;
      }
    });
  }

  onCreateSettlement(): void {
    if (!this.claimId) {
      this.notificationService.error('Please select a valid claim first.');
      return;
    }

    if (this.settlementForm.invalid) {
      this.settlementForm.markAllAsTouched();
      return;
    }

    const val = this.settlementForm.value;
    const request: SettlementRequest = {
      paymentMode: val.paymentMode,
      bankAccountNumber: val.bankAccountNumber.trim(),
      bankIfscCode: val.bankIfscCode.trim().toUpperCase(),
      transactionReference: val.transactionReference ? val.transactionReference.trim() : undefined,
      remarks: val.remarks ? val.remarks.trim() : undefined
    };

    this.submitting = true;

    this.settlementService.createSettlement(this.claimId, request).subscribe({
      next: (res) => {
        this.submitting = false;
        this.settlement = res;
        this.notificationService.success(
          `Settlement initiated! Advice generated at ${res.settlementAdvicePath || 'system storage'}.`
        );
        this.loadClaimAndSettlement();
      },
      error: (err) => {
        this.submitting = false;
        this.notificationService.error(
          err.error?.message || 'Settlement creation failed. Verify claim status is APPROVED and has assessment.'
        );
      }
    });
  }

  getStatusClass(status: string): string {
    return (status || '').toLowerCase().replace(/_/g, '-');
  }
}
