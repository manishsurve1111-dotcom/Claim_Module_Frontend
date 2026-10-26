import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../shared/models/api-response.model';
import { InvestigationRequest, InvestigationResponse } from '../model/investigation.model';

@Injectable({
  providedIn: 'root'
})
export class InvestigationService {
  private http = inject(HttpClient);

  // InvestigationController is mounted at /api/v1/claims/{claimId}/investigations
  private getBaseUrl(claimId: number): string {
    return `${environment.apiUrl}/api/v1/claims/${claimId}/investigations`;
  }

  getInvestigations(claimId: number): Observable<ApiResponse<InvestigationResponse[]>> {
    return this.http.get<ApiResponse<InvestigationResponse[]>>(this.getBaseUrl(claimId));
  }

  startInvestigation(
    claimId: number,
    request: InvestigationRequest
  ): Observable<ApiResponse<InvestigationResponse>> {
    return this.http.post<ApiResponse<InvestigationResponse>>(this.getBaseUrl(claimId), request);
  }

  submitReport(
    claimId: number,
    investigationId: number,
    reportPath: string
  ): Observable<ApiResponse<InvestigationResponse>> {
    return this.http.patch<ApiResponse<InvestigationResponse>>(
      `${this.getBaseUrl(claimId)}/${investigationId}/report`,
      { reportPath }
    );
  }
}
