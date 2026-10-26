import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../shared/models/api-response.model';
import { ClaimDocumentResponse, DocumentVerificationRequest } from '../model/document.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private http = inject(HttpClient);

  // Backend ClaimDocumentController is mapped at /api/v1/claims/{claimId}/documents
  private getBaseUrl(claimId: number): string {
    return `${environment.apiUrl}/api/v1/claims/${claimId}/documents`;
  }

  getDocuments(claimId: number): Observable<ApiResponse<ClaimDocumentResponse[]>> {
    return this.http.get<ApiResponse<ClaimDocumentResponse[]>>(this.getBaseUrl(claimId));
  }

  uploadDocument(claimId: number, documentName: string, file: File): Observable<ApiResponse<ClaimDocumentResponse>> {
    const formData = new FormData();
    formData.append('documentName', documentName);
    formData.append('file', file, file.name);

    return this.http.post<ApiResponse<ClaimDocumentResponse>>(this.getBaseUrl(claimId), formData);
  }

  verifyDocument(
    claimId: number,
    documentId: number,
    request: DocumentVerificationRequest
  ): Observable<ApiResponse<ClaimDocumentResponse>> {
    return this.http.put<ApiResponse<ClaimDocumentResponse>>(
      `${this.getBaseUrl(claimId)}/${documentId}/verify`,
      request
    );
  }
}
