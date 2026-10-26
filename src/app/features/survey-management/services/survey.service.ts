import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  SurveyAssignmentRequest,
  SurveyAssignmentResponse,
  SurveyReportRequest
} from '../model/survey.model';

@Injectable({
  providedIn: 'root'
})
export class SurveyService {
  private http = inject(HttpClient);

  // SurveyAssignmentController is mounted at /api/v1/claims/{claimId}/surveys
  private getBaseUrl(claimId: number): string {
    return `${environment.apiUrl}/api/v1/claims/${claimId}/surveys`;
  }

  getAssignments(claimId: number): Observable<SurveyAssignmentResponse[]> {
    return this.http.get<SurveyAssignmentResponse[]>(this.getBaseUrl(claimId));
  }

  assignSurveyor(
    claimId: number,
    request: SurveyAssignmentRequest
  ): Observable<SurveyAssignmentResponse> {
    return this.http.post<SurveyAssignmentResponse>(this.getBaseUrl(claimId), request);
  }

  submitSurveyReport(
    claimId: number,
    surveyId: number,
    request: SurveyReportRequest
  ): Observable<SurveyAssignmentResponse> {
    return this.http.put<SurveyAssignmentResponse>(
      `${this.getBaseUrl(claimId)}/${surveyId}/report`,
      request
    );
  }
}
