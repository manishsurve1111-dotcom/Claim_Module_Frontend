export interface ClaimApprovalRequest {
  approved: boolean;
  reason?: string;
}

export interface ClaimApprovalResponse {
  claimId: number;
  claimNumber: string;
  claimStatus: string;
  reason?: string;
}
