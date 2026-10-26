export interface InvestigationRequest {
  investigatorId: number;
  investigationReason: string;
}

export interface InvestigationResponse {
  investigationId: number;
  claimId: number;
  investigatorId: number;
  investigationReason: string;
  reportPath: string;
  investigationStatus: string;
}
