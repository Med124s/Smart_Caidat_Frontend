import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Archive, Document, LieuStockage } from '../../../model/archive.model';
import { State } from 'src/app/shared/models/state.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ArchiveService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.API_URL}/archives`; // Spring Boot REST

  // ----------------------- ARCHIVES -----------------------

  findAll(
    page: number = 0,
    size: number = 5,
  ): Observable<State<{ data: Archive[]; totalItems: number; currentPage: number; totalPages: number }>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<any>(`${this.apiUrl}/all`, { params }).pipe(
      map((res) => State.Builder<typeof res>().forSuccess(res)),
      catchError((err) => of(State.Builder<typeof err>().forError(err))),
    );
  }

  // search(keyword: string, page: number = 0, size: number = 10): Observable<State<any>> {
  //   const params = new HttpParams().set('keyword', keyword).set('page', page.toString()).set('size', size.toString());

  //   return this.http.get<any>(`${this.apiUrl}/search`, { params }).pipe(
  //     map((res) => State.Builder<any>().forSuccess(res)),
  //     catchError((err) => of(State.Builder<any>().forError(err))),
  //   );
  // }

  search(
    keyword: string,
    page: number = 0,
    size: number = 10,
  ): Observable<State<{ data: Archive[]; totalItems: number; currentPage: number; totalPages: number }>> {
    const params = new HttpParams().set('keyword', keyword).set('page', page.toString()).set('size', size.toString());
    return this.http.get<any>(`${this.apiUrl}/search`, { params }).pipe(
      map((res) => State.Builder<typeof res>().forSuccess(res)),
      catchError((err) => of(State.Builder<typeof err>().forError(err))),
    );
  }

  // findByPublicId(publicId: string): Observable<State<Archive>> {
  //   return this.http.get<Archive>(`${this.apiUrl}/findByPublicId`, { params: { publicId } }).pipe(
  //     map((res) => State.Builder<Archive>().forSuccess(res)),
  //     catchError((err) => of(State.Builder<Archive>().forError(err))),
  //   );
  // }

  findByPublicId(publicId: string): Observable<State<Archive>> {
    const params = new HttpParams().set('publicId', publicId);
    return this.http.get<Archive>(`${this.apiUrl}/findByPublicId`, { params }).pipe(
      map((res) => State.Builder<Archive>().forSuccess(res)),
      catchError((err) => of(State.Builder<Archive>().forError(err))),
    );
  }

  createArchive(
    archive: Partial<Archive>,
    files: File[],
    storageType: LieuStockage = LieuStockage.LOCAL,
  ): Observable<State<Archive>> {
    const formData = new FormData();

    // Ajout des fichiers
    files.forEach((file) => formData.append('files', file, file.name));
    // Ajout des métadonnées
    formData.append('archive', new Blob([JSON.stringify(archive)], { type: 'application/json' }));
    formData.append('storageType', storageType);

    return this.http.post<Archive>(`${this.apiUrl}/register`, formData).pipe(
      map((res) => State.Builder<Archive>().forSuccess(res)),
      catchError((err) => of(State.Builder<Archive>().forError(err))),
    );
  }

  updateArchive(
    publicId: string,
    archive: Partial<Archive>,
    files: File[] = [],
    //storageType: LieuStockage = LieuStockage.LOCAL,
  ): Observable<State<Archive>> {
    const formData = new FormData();

    // Ajouter les fichiers
    files.forEach((file) => formData.append('files', file, file.name));

    console.log('---------- LOGIQUE UPDATE ------------');

    console.log(archive);
    console.log('-------------------------   LOGIQUE FILES');

    console.log(files);

    const archiveClean = {
      ...archive,
      documents: archive.documents!.map((doc: any) => {
        const { file, ...rest } = doc; // enlever file du JSON
        return rest;
      }),
    };

    // Ajouter les métadonnées de l’archive
    formData.append('archive', new Blob([JSON.stringify(archiveClean)], { type: 'application/json' }));
    // formData.append('storageType', storageType);
    return this.http.put<Archive>(`${this.apiUrl}/${publicId}`, formData).pipe(
      map((res) => State.Builder<Archive>().forSuccess(res)),
      catchError((err) => of(State.Builder<Archive>().forError(err))),
    );
  }

  deleteArchive(id: number): Observable<State<void>> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      map(() => State.Builder<void>().forSuccessEmpty()),
      catchError((err) => of(State.Builder<void>().forError(err))),
    );
  }

  deleteArchivesBulk(publicIds: string[]): Observable<State<string[]>> {
    return this.http.delete<string[]>(`${this.apiUrl}/bulk`, { body: publicIds }).pipe(
      map((res) => State.Builder<string[]>().forSuccess(res)),
      catchError((err) => of(State.Builder<string[]>().forError(err))),
    );
  }

  // ----------------------- DOCUMENTS -----------------------

  getDocumentsByArchive(archivePublicId: string): Observable<State<Document[]>> {
    return this.http.get<Document[]>(`${this.apiUrl}/${archivePublicId}/documents`).pipe(
      map((res) => State.Builder<Document[]>().forSuccess(res)),
      catchError((err) => of(State.Builder<Document[]>().forError(err))),
    );
  }

  deleteDocument(documentPublicId: string): Observable<State<void>> {
    return this.http.delete<void>(`${environment.API_URL}/documents/${documentPublicId}`).pipe(
      map(() => State.Builder<void>().forSuccessEmpty()),
      catchError((err) => of(State.Builder<void>().forError(err))),
    );
  }

}
