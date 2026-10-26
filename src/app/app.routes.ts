import { Routes } from '@angular/router';
import { DashboardPage } from './features/dashboard/pages/dashboard/dashboard.page';
import { ClaimListPage } from './features/claim-management/pages/claim-list/claim-list.page';
import { RegisterClaimPage } from './features/claim-management/pages/register-claim/register-claim.page';
import { ClaimDetailsPage } from './features/claim-management/pages/claim-details/claim-details.page';
import { ClaimDocumentsPage } from './features/document-management/pages/claim-documents/claim-documents.page';
import { SurveyPage } from './features/survey-management/pages/survey/survey.page';
import { InvestigationPage } from './features/investigation/pages/investigation/investigation.page';
import { AssessmentPage } from './features/claim-assessment/pages/assessment/assessment.page';
import { ClaimApprovalPage } from './features/claim-approval/pages/claim-approval/claim-approval.page';
import { SettlementPage } from './features/claim-settlement/pages/settlement/settlement.page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', component: DashboardPage },
  { path: 'claims', component: ClaimListPage },
  { path: 'claims/register', component: RegisterClaimPage },
  { path: 'claims/:id', component: ClaimDetailsPage },
  { path: 'claims/:id/documents', component: ClaimDocumentsPage },
  { path: 'claims/:id/surveys', component: SurveyPage },
  { path: 'claims/:id/investigations', component: InvestigationPage },
  { path: 'claims/:id/assessment', component: AssessmentPage },
  { path: 'claims/:id/approval', component: ClaimApprovalPage },
  { path: 'claims/:id/settlement', component: SettlementPage },
  // Module convenience aliases
  { path: 'documents', component: ClaimDocumentsPage },
  { path: 'surveys', component: SurveyPage },
  { path: 'investigations', component: InvestigationPage },
  { path: 'assessments', component: AssessmentPage },
  { path: 'approvals', component: ClaimApprovalPage },
  { path: 'settlements', component: SettlementPage },
  { path: '**', redirectTo: 'dashboard' }
];
