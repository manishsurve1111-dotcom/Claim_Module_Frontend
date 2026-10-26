export type SurveyStatus =
  | 'ASSIGNED'
  | 'INSPECTION_IN_PROGRESS'
  | 'REPORT_SUBMITTED'
  | 'CANCELLED';

export interface SurveyAssignmentRequest {
  surveyorId: number;
  inspectionDate: string; // ISO string e.g. 2026-10-27T10:00:00
}

export interface SurveyAssignmentResponse {
  surveyId: number;
  claimId: number;
  surveyorId: number;
  assignedDate: string;
  inspectionDate: string;
  reportPath: string;
  surveyStatus: SurveyStatus;
}

export interface SurveyReportRequest {
  damageDescription: string;
  assessedDamageAmount: number;
  surveyorRemarks?: string;
  recommendation: string;
}
