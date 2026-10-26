export type ClaimType = 'HEALTH' | 'LIFE' | 'VEHICLE';

export type ClaimStatus =
  | 'REGISTERED'
  | 'PENDING_VERIFICATION'
  | 'UNDER_SURVEY'
  | 'UNDER_INVESTIGATION'
  | 'INVESTIGATION_COMPLETED'
  | 'ASSESSED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'PENDING_SETTLEMENT'
  | 'SETTLED';

export interface ClaimRequest {
  policyId: number;
  customerId: number;
  customerEmail?: string;
  claimType: ClaimType;
  incidentDate: string; // YYYY-MM-DD
  estimatedLoss: number;
}

export interface ClaimResponse {
  claimId: number;
  claimNumber: string;
  policyId: number;
  customerId: number;
  claimType: ClaimType;
  incidentDate: string;
  claimDate: string;
  estimatedLoss: number;
  claimStatus: ClaimStatus | string;
}

export interface ClaimEligibilityResponse {
  eligible: boolean;
  errors: string[];
}
