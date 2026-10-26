import { ClaimResponse } from '../../claim-management/model/claim.model';

export interface DashboardStats {
  totalClaims: number;
  totalEstimatedLoss: number;
  statusCounts: Record<string, number>;
  typeCounts: Record<string, number>;
  recentClaims: ClaimResponse[];
}
