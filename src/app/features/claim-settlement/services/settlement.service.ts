import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SettlementRequest, SettlementResponse } from '../model/settlement.model';

@Injectable({
  providedIn: 'root'
})
export class SettlementService {
  private http = inject(HttpClient);

  // ClaimSettlementController is mounted at /api/v1/claims
  private getBaseUrl(claimId: number): string {
    return `${environment.apiUrl}/api/v1/claims/${claimId}/settlement`;
  }

  getSettlement(claimId: number): Observable<SettlementResponse> {
    return this.http.get<SettlementResponse>(this.getBaseUrl(claimId));
  }

  createSettlement(
    claimId: number,
    request: SettlementRequest
  ): Observable<SettlementResponse> {
    return this.http.post<SettlementResponse>(this.getBaseUrl(claimId), request);
  }
}
