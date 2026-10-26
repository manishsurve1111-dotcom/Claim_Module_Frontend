import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ClaimService } from '../../claim-management/services/claim.service';
import { DashboardStats } from '../model/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private claimService = inject(ClaimService);

  getDashboardStats(): Observable<DashboardStats> {
    return this.claimService.getAllClaims().pipe(
      map(response => {
        const claims = response.data || [];
        const totalClaims = claims.length;
        let totalEstimatedLoss = 0;
        const statusCounts: Record<string, number> = {};
        const typeCounts: Record<string, number> = {};

        claims.forEach(c => {
          totalEstimatedLoss += Number(c.estimatedLoss) || 0;

          const status = c.claimStatus || 'UNKNOWN';
          statusCounts[status] = (statusCounts[status] || 0) + 1;

          const type = c.claimType || 'UNKNOWN';
          typeCounts[type] = (typeCounts[type] || 0) + 1;
        });

        // Most recent 5 claims sorted by claimId descending
        const recentClaims = [...claims].sort((a, b) => b.claimId - a.claimId).slice(0, 5);

        return {
          totalClaims,
          totalEstimatedLoss,
          statusCounts,
          typeCounts,
          recentClaims
        };
      })
    );
  }
}
