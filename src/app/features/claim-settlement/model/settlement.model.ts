export type PaymentMode = 'NEFT' | 'RTGS' | 'IMPS' | 'UPI' | 'CHEQUE';

export type SettlementStatus = 'PENDING' | 'PAID' | 'FAILED';

export interface SettlementRequest {
  paymentMode: PaymentMode;
  transactionReference?: string;
  bankAccountNumber: string;
  bankIfscCode: string;
  remarks?: string;
}

export interface SettlementResponse {
  settlementId: number;
  claimId: number;
  claimNumber: string;
  approvedAmount: number;
  paymentMode: PaymentMode;
  transactionReference: string;
  settlementDate: string;
  settlementStatus: SettlementStatus;
  settlementAdvicePath: string;
  remarks?: string;
}
