export interface ClaimAssessmentResponse {
  assessmentId: number;
  claimId: number;
  assessedAmount: number;
  deductible: number;
  depreciation: number;
  nonPayable: number;
  netPayable: number;
}
