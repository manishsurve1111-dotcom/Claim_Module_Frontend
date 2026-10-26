import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ClaimAssessmentResponse } from '../model/assessment.model';

@Injectable({
  providedIn: 'root'
})
export class AssessmentService {
  private http = inject(HttpClient);

  // ClaimAssessmentController is mounted at /api/v1/claims
  private getBaseUrl(claimId: number): string {
    return `${environment.apiUrl}/api/v1/claims/${claimId}/assessments`;
  }

  getAssessments(claimId: number): Observable<ClaimAssessmentResponse[]> {
    return this.http.get<ClaimAssessmentResponse[]>(this.getBaseUrl(claimId));
  }

  createAssessment(claimId: number): Observable<ClaimAssessmentResponse> {
    // Backend automatically performs calculations based on claim estimated loss
    return this.http.post<ClaimAssessmentResponse>(this.getBaseUrl(claimId), {});
  }
}
