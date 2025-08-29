// document.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = 'http://localhost:8080/api/requests'; // بدل URL باللي عندك

  constructor(private http: HttpClient) {}

  getPreviewUrl(publicId: string, fileName: string): string {
    return `${this.apiUrl}/${publicId}/documents/${fileName}/preview`;
  }

  getDownloadUrl(publicId: string, fileName: string): string {
    return `${this.apiUrl}/${publicId}/documents/${fileName}`;
  }
}
