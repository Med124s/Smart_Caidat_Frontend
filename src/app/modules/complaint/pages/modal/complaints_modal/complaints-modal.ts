import { NgIf, NgFor, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Document } from 'src/app/modules/documents_managements/archive_document/model/archive.model';

@Component({
  selector: 'app-request-document-modal',
  standalone: true,
  imports: [ReactiveFormsModule, NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault],
  templateUrl: './request-modal.component.html',
  styleUrls: ['./request-modal.component.css'],
})
export class DocumentRequestModalComponent {
  @Input() visible = false;
  @Input() documents: Document[] = [];
  @Output() close = new EventEmitter<void>();

  @Input() storageType: 'LOCAL' | 'MINIO' = 'LOCAL'; // type de stockage
  @Input() backendBaseUrl: string = ''; // ex: http://localhost:8080/api/archives


  // getDocumentUrl(doc: Document): string {
  //   if (!doc.fileName) return '';

  //   if (this.storageType === 'MINIO') {
  //     // lien direct vers minio backend
  //     return `${this.backendBaseUrl}/documents/${doc.fileName}`;
  //   }

  //   // LOCAL: passer par backend pour download
  //   return `${environment}/archives/documents/${doc.fileName}`;
  // }



  getFileType(mimeType?: string): string {
    if (!mimeType) return 'other';
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('word') || mimeType.includes('doc')) return 'word';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'excel';
    if (mimeType.includes('image')) return 'image';
    return 'other';
  }

  // // Génère l'URL pour le lien
  getDocumentUrl(doc: any): string {
    return ""
  }
  onClose() {
    this.close.emit();
  }

}
