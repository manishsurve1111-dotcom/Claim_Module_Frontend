# Insurance Management System — Angular Frontend

A modern, modular, beginner-friendly Angular 20 frontend for the Insurance Management System (Claim Lifecycle Management), styled consistently with Angular Material and connected directly to the Spring Boot REST backend running on port `8081`.

---

## 1. Project Overview

This frontend provides a complete user interface for managing the end-to-end insurance claim lifecycle:
- **Dashboard**: Real-time KPI statistics calculated from backend claims, status breakdown, and recent claims table.
- **Claim Management**:
  - **Claim List**: Filter and search claims by ID, claim number, status, or type.
  - **Register Claim**: Reactive form with client-side validation and backend policy eligibility pre-checking.
  - **Claim Details**: Complete metadata display and quick navigation to all lifecycle stages.
- **Document Management**: Multipart file upload (`.pdf, .jpg, .jpeg, .png`, max 5MB) and document verification (`VERIFIED` / `REJECTED`).
- **Survey Management**: Assign licensed surveyors for vehicle claims exceeding the `₹1,00,000` threshold and file damage assessment findings that trigger backend survey PDF generation.
- **Investigation Management**: Initiate fraud investigations (`UNDER_INVESTIGATION`) and submit investigation report paths (`INVESTIGATION_COMPLETED`).
- **Claim Assessment**: Call backend assessment calculation (deductible, depreciation, non-payable deductions, net payable) and automatically transition claim to `PENDING_APPROVAL`.
- **Claim Approval**: Adjudication workspace to approve or reject claims with mandatory rejection reasons.
- **Claim Settlement**: Record banking verification details, payment modes (NEFT, RTGS, IMPS, UPI, CHEQUE), and generate settlement advice PDFs.

---

## 2. Technology Stack & Versions

- **Framework**: Angular `20.2.0` (using Standalone Components)
- **Language**: TypeScript `~5.9.2`
- **UI Components**: Angular Material `^20.2.0` (`@angular/material`, `@angular/cdk`)
- **HTTP Client**: `@angular/common/http` with standalone `provideHttpClient` and error interceptors
- **Reactive State**: RxJS `~7.8.0`
- **Forms**: Reactive Forms (`FormBuilder`, `FormGroup`, `Validators`)
- **Styles**: Plain CSS with CSS Custom Properties and Material Theme (`indigo-pink.css`)
- **Node.js**: `v20.x` or higher (`v24.20.0` tested)
- **Package Manager**: npm `11.x`

---

## 3. Installation & Running Instructions

### Step 1: Install Dependencies
Open a terminal in the frontend directory:
```bash
npm install
```

### Step 2: Start the Development Server
```bash
npm start
# or
ng serve
```
Open your browser and navigate to:
```
http://localhost:4200/
```

### Step 3: Production Build
```bash
npm run build
```
The compiled output is saved in the `dist/insurance-management-angular` directory.

---

## 4. Backend URL Configuration

The API base URL is configured in `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8081'
};
```
And for production in `src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'http://localhost:8081'
};
```
Feature services inject `environment.apiUrl` dynamically. No API URLs are hardcoded inside components.

---

## 5. Feature Folder Structure

```
src/app/
├── app.component.ts               # App layout with MatToolbar and MatSidenav
├── app.component.html
├── app.component.css
├── app.routes.ts                  # Application routing table
├── core/
│   ├── interceptors/
│   │   └── error.interceptor.ts   # Global HTTP error handler
│   └── services/
│       └── notification.service.ts # Toast alert notifications via MatSnackBar
├── shared/
│   ├── models/
│   │   └── api-response.model.ts  # Generic ApiResponse<T> wrapper
│   └── components/
│       └── status-badge/          # Reusable status chip badge
└── features/
    ├── dashboard/
    │   ├── model/dashboard.model.ts
    │   ├── services/dashboard.service.ts
    │   └── pages/dashboard/
    │       ├── dashboard.page.ts
    │       ├── dashboard.page.html
    │       └── dashboard.page.css
    ├── claim-management/
    │   ├── model/claim.model.ts
    │   ├── services/claim.service.ts
    │   └── pages/
    │       ├── claim-list/
    │       │   ├── claim-list.page.ts
    │       │   ├── claim-list.page.html
    │       │   └── claim-list.page.css
    │       ├── claim-details/
    │       │   ├── claim-details.page.ts
    │       │   ├── claim-details.page.html
    │       │   └── claim-details.page.css
    │       └── register-claim/
    │           ├── register-claim.page.ts
    │           ├── register-claim.page.html
    │           └── register-claim.page.css
    ├── document-management/
    │   ├── model/document.model.ts
    │   ├── services/document.service.ts
    │   └── pages/claim-documents/
    │       ├── claim-documents.page.ts
    │       ├── claim-documents.page.html
    │       └── claim-documents.page.css
    ├── survey-management/
    │   ├── model/survey.model.ts
    │   ├── services/survey.service.ts
    │   └── pages/survey/
    │       ├── survey.page.ts
    │       ├── survey.page.html
    │       └── survey.page.css
    ├── investigation/
    │   ├── model/investigation.model.ts
    │   ├── services/investigation.service.ts
    │   └── pages/investigation/
    │       ├── investigation.page.ts
    │       ├── investigation.page.html
    │       └── investigation.page.css
    ├── claim-assessment/
    │   ├── model/assessment.model.ts
    │   ├── services/assessment.service.ts
    │   └── pages/assessment/
    │       ├── assessment.page.ts
    │       ├── assessment.page.html
    │       └── assessment.page.css
    ├── claim-approval/
    │   ├── model/approval.model.ts
    │   ├── services/approval.service.ts
    │   └── pages/claim-approval/
    │       ├── claim-approval.page.ts
    │       ├── claim-approval.page.html
    │       └── claim-approval.page.css
    └── claim-settlement/
        ├── model/settlement.model.ts
        ├── services/settlement.service.ts
        └── pages/settlement/
            ├── settlement.page.ts
            ├── settlement.page.html
            └── settlement.page.css
```

---

## 6. Actual Backend API Endpoints Connected

| Feature | Method | Actual Route | Request Format | Response Format |
|---|---|---|---|---|
| **Claim Register** | `POST` | `/api/v1/claim` | `JSON (ClaimRequest)` | `ApiResponse<ClaimResponse>` |
| **All Claims** | `GET` | `/api/v1/claim` | — | `ApiResponse<List<ClaimResponse>>` |
| **Claim Details** | `GET` | `/api/v1/claim/{claimId}` | — | `ApiResponse<ClaimResponse>` |
| **Eligibility Check** | `GET` | `/api/v1/claims/policy-eligibility` | Query params | `ApiResponse<ClaimEligibilityResponse>` |
| **List Documents** | `GET` | `/api/v1/claims/{claimId}/documents` | — | `ApiResponse<List<ClaimDocumentResponse>>` |
| **Upload Document** | `POST` | `/api/v1/claims/{claimId}/documents` | `multipart/form-data` (`documentName`, `file`) | `ApiResponse<ClaimDocumentResponse>` |
| **Verify Document** | `PUT` | `/api/v1/claims/{claimId}/documents/{documentId}/verify` | `JSON (DocumentVerificationRequest)` | `ApiResponse<ClaimDocumentResponse>` |
| **Assign Surveyor** | `POST` | `/api/v1/claims/{claimId}/surveys` | `JSON (SurveyAssignmentRequest)` | `SurveyAssignmentResponse` |
| **Survey Report** | `PUT` | `/api/v1/claims/{claimId}/surveys/{surveyId}/report` | `JSON (SurveyReportRequest)` | `SurveyAssignmentResponse` |
| **List Surveys** | `GET` | `/api/v1/claims/{claimId}/surveys` | — | `List<SurveyAssignmentResponse>` |
| **Start Investigation** | `POST` | `/api/v1/claims/{claimId}/investigations` | `JSON (InvestigationRequest)` | `ApiResponse<InvestigationResponse>` |
| **List Investigations** | `GET` | `/api/v1/claims/{claimId}/investigations` | — | `ApiResponse<List<InvestigationResponse>>` |
| **Investigation Report** | `PATCH` | `/api/v1/claims/{claimId}/investigations/{investigationId}/report` | `JSON { reportPath: string }` | `ApiResponse<InvestigationResponse>` |
| **Create Assessment** | `POST` | `/api/v1/claims/{claimId}/assessments` | `{}` (Auto-calculated by backend) | `ClaimAssessmentResponse` |
| **Get Assessments** | `GET` | `/api/v1/claims/{claimId}/assessments` | — | `List<ClaimAssessmentResponse>` |
| **Approve / Reject** | `PUT` | `/api/v1/claims/{claimId}/approval` | `JSON (ClaimApprovalRequest)` | `ClaimApprovalResponse` |
| **Approval Claims List** | `GET` | `/api/v1/claims` | — | `List<ClaimApprovalResponse>` |
| **Create Settlement** | `POST` | `/api/v1/claims/{claimId}/settlement` | `JSON (SettlementRequestDto)` | `SettlementResponseDto` |
| **Get Settlement** | `GET` | `/api/v1/claims/{claimId}/settlement` | — | `SettlementResponseDto` |

---

## 7. Discrepancies & Backend Implementation Notes

1. **Endpoint Prefix Discrepancy**:
   - `ClaimController` uses `/api/v1/claim` (singular) for registration and fetching claim details.
   - All other controllers (`ClaimDocumentController`, `SurveyAssignmentController`, `InvestigationController`, `ClaimAssessmentController`, `ClaimApprovalController`, `ClaimSettlementController`, and `ClaimEligibilityController`) use `/api/v1/claims` (plural). The frontend strictly respects each controller's actual path.
2. **Response Envelopes**:
   - Endpoints from `ClaimController`, `ClaimDocumentController`, `InvestigationController`, and `ClaimEligibilityController` return responses wrapped inside `ApiResponse<T>`.
   - Endpoints from `ClaimApprovalController`, `ClaimAssessmentController`, `SurveyAssignmentController`, and `ClaimSettlementController` return DTOs and arrays directly without the `ApiResponse` wrapper. The frontend services are strongly typed according to each controller's exact return signature.
3. **Mandatory Survey Threshold**:
   - The backend enforces that surveyor assignment is required only for `VEHICLE` claims whose `estimatedLoss > ₹1,00,000`. Attempting to assign a surveyor for health/life claims or vehicle claims under 1 lakh will be rejected by backend business rules with: `"Mandatory survey assignment is not required for this claim under the configured threshold"`.
4. **Assessment Prerequisites**:
   - The backend requires all uploaded claim documents to be in `VERIFIED` status prior to running `createAssessment()`. If unverified documents exist or no documents were uploaded, the backend rejects assessment.
5. **Approval Decision Validation**:
   - The backend `ClaimApprovalServiceImpl` only allows approving or rejecting claims whose status is `PENDING_APPROVAL`. If `approved === false`, a non-empty `reason` is strictly required.

---

## 8. Backend Services Required & CORS Setup

### Services Required:
1. **Insurance Management Service** running on port `8081`.
2. **MySQL Database** running on port `3306` with database `Claim_Management`.
3. *(Optional)* **Policy Service** (`http://localhost:8082`) and **Premium Service** (`http://localhost:8083`) if full external eligibility checks are enabled.

### CORS Configuration:
If you encounter browser CORS errors when connecting `http://localhost:4200` to `http://localhost:8081`, ensure your Spring Boot controllers have `@CrossOrigin(origins = "http://localhost:4200")` or add a `WebMvcConfigurer` bean in your backend:
```java
@Bean
public WebMvcConfigurer corsConfigurer() {
    return new WebMvcConfigurer() {
        @Override
        public void addCorsMappings(CorsRegistry registry) {
            registry.addMapping("/**")
                    .allowedOrigins("http://localhost:4200")
                    .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                    .allowedHeaders("*");
        }
    };
}
```
