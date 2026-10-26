import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../shared/models/api-response.model';
import { ClaimEligibilityResponse, ClaimRequest, ClaimResponse } from '../model/claim.model';

@Injectable({
  providedIn: 'root'
})
export class ClaimService {
  private http = inject(HttpClient);
  // Backend ClaimController is mounted at /api/v1/claim
  private claimUrl = `${environment.apiUrl}/api/v1/claim`;
  // Backend ClaimEligibilityController is mounted at /api/v1/claims
  private eligibilityUrl = `${environment.apiUrl}/api/v1/claims/policy-eligibility`;

  getAllClaims(): Observable<ApiResponse<ClaimResponse[]>> {
    return this.http.get<ApiResponse<ClaimResponse[]>>(this.claimUrl);
  }

  getClaimById(claimId: number): Observable<ApiResponse<ClaimResponse>> {
    return this.http.get<ApiResponse<ClaimResponse>>(`${this.claimUrl}/${claimId}`);
  }

  registerClaim(request: ClaimRequest): Observable<ApiResponse<ClaimResponse>> {
    return this.http.post<ApiResponse<ClaimResponse>>(this.claimUrl, request);
  }

  checkEligibility(
    policyId: number,
    customerId: number,
    incidentDate: string,
    claimType: string,
    estimatedLoss: number
  ): Observable<ApiResponse<ClaimEligibilityResponse>> {
    let params = new HttpParams()
      .set('policyId', policyId.toString())
      .set('customerId', customerId.toString())
      .set('incidentDate', incidentDate)
      .set('claimType', claimType)
      .set('estimatedLoss', estimatedLoss.toString());

    return this.http.get<ApiResponse<ClaimEligibilityResponse>>(this.eligibilityUrl, { params });
  }
}
