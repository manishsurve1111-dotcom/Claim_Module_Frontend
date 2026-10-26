export type DocumentVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface ClaimDocumentResponse {
  documentId: number;
  claimId: number;
  documentName: string;
  filePath: string;
  verificationStatus: string;
}

export interface DocumentVerificationRequest {
  verificationStatus: 'VERIFIED' | 'REJECTED';
  remarks?: string;
}
