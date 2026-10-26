import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DocumentService } from '../../services/document.service';
import { ClaimService } from '../../../claim-management/services/claim.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ClaimDocumentResponse } from '../../model/document.model';
import { ClaimResponse } from '../../../claim-management/model/claim.model';

@Component({
  selector: 'app-claim-documents-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './claim-documents.page.html',
  styleUrl: './claim-documents.page.css'
})
export class ClaimDocumentsPage implements OnInit {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private documentService = inject(DocumentService);
  private claimService = inject(ClaimService);
  private notificationService = inject(NotificationService);

  claimId: number | null = null;
  claim: ClaimResponse | null = null;
  allClaims: ClaimResponse[] = [];

  documents: ClaimDocumentResponse[] = [];
  loading = false;
  uploading = false;
  verifyingId: number | null = null;
  error = '';

  uploadForm!: FormGroup;
  selectedFile: File | null = null;
  fileError = '';

  // Verification modal / inline form state
  verifyingDocument: ClaimDocumentResponse | null = null;
  verificationDecision: 'VERIFIED' | 'REJECTED' = 'VERIFIED';
  verificationRemarks = '';

  displayedColumns: string[] = ['documentId', 'documentName', 'filePath', 'verificationStatus', 'actions'];

  ngOnInit(): void {
    this.initForm();

    const paramId = this.route.snapshot.paramMap.get('id');
    if (paramId) {
      this.claimId = Number(paramId);
      this.loadClaimAndDocuments();
    } else {
      // If accessed without ID, fetch claims to allow user selection
      this.loadAllClaims();
    }
  }

  initForm(): void {
    this.uploadForm = this.fb.group({
      documentName: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  loadAllClaims(): void {
    this.claimService.getAllClaims().subscribe({
      next: (res) => {
        this.allClaims = res.data || [];
        if (this.allClaims.length > 0 && !this.claimId) {
          this.claimId = this.allClaims[0].claimId;
          this.loadClaimAndDocuments();
        }
      },
      error: () => {}
    });
  }

  onClaimSelected(): void {
    if (this.claimId) {
      this.loadClaimAndDocuments();
    }
  }

  loadClaimAndDocuments(): void {
    if (!this.claimId) return;

    this.loading = true;
    this.error = '';

    // Load claim details
    this.claimService.getClaimById(this.claimId).subscribe({
      next: (res) => {
        this.claim = res.data;
      },
      error: () => {}
    });

    // Load documents
    this.documentService.getDocuments(this.claimId).subscribe({
      next: (res) => {
        this.documents = res.data || [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to load documents for this claim.';
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.fileError = '';

    if (!input.files || input.files.length === 0) {
      this.selectedFile = null;
      return;
    }

    const file = input.files[0];
    const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (!ext || !allowedExtensions.includes(ext)) {
      this.fileError = 'Invalid file type. Only PDF, JPG, JPEG, and PNG files are allowed.';
      this.selectedFile = null;
      input.value = '';
      return;
    }

    // 5MB max size
    if (file.size > 5 * 1024 * 1024) {
      this.fileError = 'File size exceeds maximum allowed size of 5MB.';
      this.selectedFile = null;
      input.value = '';
      return;
    }

    this.selectedFile = file;
  }

  onUpload(): void {
    if (!this.claimId) {
      this.notificationService.error('Please select a valid claim first.');
      return;
    }

    if (this.uploadForm.invalid || !this.selectedFile) {
      this.uploadForm.markAllAsTouched();
      if (!this.selectedFile) {
        this.fileError = 'Please select a document file to upload.';
      }
      return;
    }

    const docName = this.uploadForm.value.documentName.trim();
    this.uploading = true;
    this.fileError = '';

    this.documentService.uploadDocument(this.claimId, docName, this.selectedFile).subscribe({
      next: (res) => {
        this.uploading = false;
        this.notificationService.success('Document uploaded successfully!');
        this.uploadForm.reset();
        this.selectedFile = null;
        this.loadClaimAndDocuments();
      },
      error: (err) => {
        this.uploading = false;
        this.notificationService.error(err.error?.message || 'Failed to upload document.');
      }
    });
  }

  openVerifyModal(doc: ClaimDocumentResponse, decision: 'VERIFIED' | 'REJECTED'): void {
    this.verifyingDocument = doc;
    this.verificationDecision = decision;
    this.verificationRemarks = '';
  }

  cancelVerify(): void {
    this.verifyingDocument = null;
    this.verificationRemarks = '';
  }

  submitVerification(): void {
    if (!this.claimId || !this.verifyingDocument) return;

    this.verifyingId = this.verifyingDocument.documentId;

    this.documentService.verifyDocument(this.claimId, this.verifyingDocument.documentId, {
      verificationStatus: this.verificationDecision,
      remarks: this.verificationRemarks.trim() || undefined
    }).subscribe({
      next: () => {
        this.verifyingId = null;
        this.notificationService.success(
          `Document marked as ${this.verificationDecision} successfully.`
        );
        this.cancelVerify();
        this.loadClaimAndDocuments();
      },
      error: (err) => {
        this.verifyingId = null;
        this.notificationService.error(err.error?.message || 'Verification update failed.');
      }
    });
  }

  getStatusClass(status: string): string {
    return (status || '').toLowerCase().replace(/_/g, '-');
  }
}
