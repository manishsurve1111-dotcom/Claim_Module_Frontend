import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ClaimApprovalRequest, ClaimApprovalResponse } from '../model/approval.model';

@Injectable({
  providedIn: 'root'
})
export class ApprovalService {
  private http = inject(HttpClient);

  // ClaimApprovalController is mounted at /api/v1/claims
  private claimsUrl = `${environment.apiUrl}/api/v1/claims`;

  getAllClaims(): Observable<ClaimApprovalResponse[]> {
    return this.http.get<ClaimApprovalResponse[]>(this.claimsUrl);
  }

  approveOrRejectClaim(
    claimId: number,
    request: ClaimApprovalRequest
  ): Observable<ClaimApprovalResponse> {
    return this.http.put<ClaimApprovalResponse>(
      `${this.claimsUrl}/${claimId}/approval`,
      request
    );
  }
}
