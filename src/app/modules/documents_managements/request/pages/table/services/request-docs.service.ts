import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { RequestDocument, RequestStatus } from '../../../model/request.model';
import { SearchResponse } from '../../../model/request-search';
import { catchError, map, Observable, of, startWith } from 'rxjs';
import { Pagination } from 'src/app/shared/models/request.model';
import { State } from 'src/app/shared/models/state.model';
import { environment } from 'src/environments/environment';
import { NotificationService } from './notification-service';

@Injectable({
  providedIn: 'root',
})
export class RequestService {
  private http = inject(HttpClient);
  private notificationService = inject(NotificationService);

  search(query: string, pagination: Pagination): Observable<State<SearchResponse<RequestDocument>>> {
    const params = new HttpParams()
      .set('keyword', query)
      .set('page', pagination.page.toString())
      .set('size', pagination.size.toString())
      .set('sort', pagination.sort.join(','));

    return this.http.get<SearchResponse<RequestDocument>>(`${environment.API_URL}/requests/search`, { params }).pipe(
      map((res) => State.Builder<SearchResponse<RequestDocument>>().forSuccess(res)),
      startWith(State.Builder<SearchResponse<RequestDocument>>().forInit()),
      catchError((err) => of(State.Builder<SearchResponse<RequestDocument>>().forError(err))),
    );
  }

  create(request: RequestDocument): Observable<State<RequestDocument>> {
    return this.http.post<RequestDocument>(`${environment.API_URL}/requests/register`, request).pipe(
      map((res) => State.Builder<RequestDocument>().forSuccess(res)),
      startWith(State.Builder<RequestDocument>().forInit()),
      catchError((err) => of(State.Builder<RequestDocument>().forError(err))),
    );
  }

  update(request: RequestDocument): Observable<State<RequestDocument>> {
    return this.http.patch<RequestDocument>(`${environment.API_URL}/requests/update`, request).pipe(
      map((res) => State.Builder<RequestDocument>().forSuccess(res)),
      startWith(State.Builder<RequestDocument>().forInit()),
      catchError((err) => of(State.Builder<RequestDocument>().forError(err))),
    );
  }

  delete(ids: string[]): Observable<State<string[]>> {
    return this.http.delete<string[]>(`${environment.API_URL}/requests/delete`).pipe(
      map((res: string[]) => State.Builder<string[]>().forSuccess(res)),
      startWith(State.Builder<string[]>().forInit()),
      catchError((err) => of(State.Builder<any>().forError(err))),
    );
  }

  approveRequest(id: number) {
    return this.http.post(`${environment.API_URL}/requests/${id}/approve`, {}, { responseType: 'blob' });
  }

  uploadCertificate(requestId: string, file: Blob) {
    const formData = new FormData();
    formData.append('file', file, `certificat_${requestId}.pdf`);
    return this.http.post(`${environment.API_URL}/requests/${requestId}/certificate`, formData);
  }
  
  createWithFile(formData: FormData): Observable<State<RequestDocument>> {
    return this.http.post<State<RequestDocument>>(`${environment.API_URL}/requests`, formData);
  }

  updateWithFile(formData: FormData): Observable<State<RequestDocument>> {
    return this.http.put<State<RequestDocument>>(`${environment.API_URL}/requests`, formData);
  }

  //   updateStatus(
  //   requestId: string,
  //   status: RequestStatus,
  //   validatorId: string
  // ): Observable<State<RequestDocument>> {
  //   // Ici on envoie le status + validatorId en query params
  //   const params = new HttpParams()
  //     .set('publicId', requestId)
  //     .set('status', status)
  //     .set('validatorId', validatorId);

  //   return this.http
  //     .patch<RequestDocument>(`${environment.API_URL}/requests/updateByStatus`, null, { params })
  //     .pipe(
  //       map(res => State.Builder<RequestDocument>().forSuccess(res)),
  //       startWith(State.Builder<RequestDocument>().forInit()),
  //       catchError(err => of(State.Builder<RequestDocument>().forError(err)))
  //     );
  // }

  updateStatus(requestId: string, status: RequestStatus, validatorId: string): Observable<State<RequestDocument>> {
    const params = new HttpParams().set('publicId', requestId).set('status', status).set('validatorId', validatorId);

    return this.http.patch<RequestDocument>(`${environment.API_URL}/requests/updateByStatus`, null, { params }).pipe(
      map((res) => {
        // 🔹 Si on passe la demande en VALIDATED → mettre à jour la notif
        if (status != RequestStatus.PENDING) {
          this.notificationService.decrementPendingCount();
        }

        return State.Builder<RequestDocument>().forSuccess(res);
      }),
      startWith(State.Builder<RequestDocument>().forInit()),
      catchError((err) => of(State.Builder<RequestDocument>().forError(err))),
    );
  }
}

//   private searchQuery$ = new Subject<SearchQuery>();
//   private searchResult$ = new Subject<State<SearchResponse<RequestDocument>>>();
//   searchResult = this.searchResult$.asObservable();

//   private requestsByCitizen$ = new Subject<{ citizenPublicId: string; searchQuery: SearchQuery }>();

//   private searchRequestByCitizen$ = new Subject<State<SearchResponse<RequestDocument>>>();
//   searchResultByCitizen = this.searchRequestByCitizen$.asObservable();

//   // private create$ = new Subject<State<RequestDocument>>();
//   // create = this.create$.asObservable();

//   //  ✅ بدل Subject بـ BehaviorSubject باش يحتافظ بالقيمة الأخيرة
//   private create$ = new BehaviorSubject<State<RequestDocument>>(State.Builder<RequestDocument>().forInit());
//   create = this.create$.asObservable();

//   private delete$ = new Subject<State<string[]>>();
//   delete = this.delete$.asObservable();

//   constructor() {
//     this.listenToSearch();
//     this.listenToFetchRequestByCitizen();
//   }

//   private listenToSearch(): void {
//     this.searchQuery$
//       .pipe(
//         distinctUntilChanged(),
//         debounce(() => timer(300)),
//         switchMap((query) =>
//           this.fetchResult(query).pipe(
//             catchError((err) => {
//               this.searchResult$.next(State.Builder<SearchResponse<RequestDocument>>().forError(err));
//               return of({ data: [], currentPage: 0, totalItems: 0, totalPages: 0 });
//             }),
//           ),
//         ),
//       )
//       .subscribe({
//         next: (res) => this.searchResult$.next(State.Builder<SearchResponse<RequestDocument>>().forSuccess(res)),
//         error: (err) => this.searchResult$.next(State.Builder<SearchResponse<RequestDocument>>().forError(err)),
//       });
//   }

// private listenToFetchRequestByCitizen(): void {
//   this.requestsByCitizen$
//     .pipe(
//       distinctUntilChanged(),
//       debounce(() => timer(300)),
//       switchMap(({ citizenPublicId, searchQuery }) =>
//         this.fetchRequestsByCitizen(citizenPublicId, searchQuery).pipe(
//           catchError((err) => {
//             this.searchRequestByCitizen$.next(
//               State.Builder<SearchResponse<RequestDocument>>().forError(err)
//             );
//             return of({ data: [], currentPage: 0, totalItems: 0, totalPages: 0 });
//           })
//         )
//       )
//     )
//     .subscribe({
//       next: (res) =>
//         this.searchRequestByCitizen$.next(
//           State.Builder<SearchResponse<RequestDocument>>().forSuccess(res)
//         ),
//       error: (err) =>
//         this.searchRequestByCitizen$.next(
//           State.Builder<SearchResponse<RequestDocument>>().forError(err)
//         ),
//     });
// }

//   private fetchResult(searchQuery: SearchQuery): Observable<SearchResponse<RequestDocument>> {
//     let params = createPaginationOption(searchQuery.page);
//     params = params.set('query', searchQuery.query);
//     return this.http.get<SearchResponse<RequestDocument>>(`${environment.API_URL}/requests/findByRequestDocument`, { params });
//   }

//   searchRequest(searchQuery: SearchQuery): void {
//     this.searchQuery$.next(searchQuery);
//   }

//   triggerFetchRequestsByCitizen(citizenPublicId: string, searchQuery: SearchQuery) {
//   this.requestsByCitizen$.next({ citizenPublicId, searchQuery });
// }

//   fetchRequestsByCitizen(citizenPublicId: string, searchQuery: SearchQuery): Observable<SearchResponse<RequestDocument>> {
//   let params = createPaginationOption(searchQuery.page);
//   params = params.set('citizenPublicId', citizenPublicId);

//   if (searchQuery.query) {
//     params = params.set('query', searchQuery.query);
//   }
//     console.log("FRONTEND CALLING API fetchRequestsByCitizen");

//   return this.http.get<SearchResponse<RequestDocument>>(
//     `${environment.API_URL}/requests/findByCitizen`,
//     { params }
//   );
// }

// fetchRequestsByRequestDocument(RequestDocumentPublicId: string) {
//   let params = createPaginationOption(searchQuery.page);
//   params = params.set('query', searchQuery.query);
//   return this.http.get<SearchResponse<RequestDocument>>(`${environment.API_URL}/requests/findByRequestDocument`, { params });
// }

// saveRequestDocument(RequestDocument: RequestDocument, file?: File): void {
//   const formData = new FormData();
//   const RequestDocumentPayload = {
//     publicId: RequestDocument.publicId,
//     firstName: RequestDocument.firstName,
//     lastName: RequestDocument.lastName,
//     idcs: RequestDocument.idcs,
//     address: RequestDocument.address,
//     email: RequestDocument.email,
//     maritalStatus: RequestDocument.maritalStatus, // attention à bien utiliser la clé correcte
//     cin: RequestDocument.cin,
//     phone: RequestDocument.phone,
//     gender: RequestDocument.gender,
//     dateBirth:
//       typeof RequestDocument.dateBirth === 'string'
//         ? RequestDocument.dateBirth
//         : new Date(RequestDocument.dateBirth!).toISOString().split('T')[0], // yyyy-MM-dd
//   };
//   // ✅ Envoyer le JSON stringifié
//   formData.append('RequestDocument', JSON.stringify(RequestDocumentPayload));
//   if (file) {
//     formData.append('imageUrl', file);
//   }
//   this.http.post<RequestDocument>(`${environment.API_URL}/RequestDocuments/register`, formData).subscribe({
//     next: (res) => this.create$.next(State.Builder<RequestDocument>().forSuccess(res)),
//     error: (err: HttpErrorResponse) => this.create$.next(State.Builder<RequestDocument>().forError(err)),
//   });
// }

// updateRequestDocument(RequestDocument: RequestDocument, file?: File) {
//   const formData = new FormData();

//   const RequestDocumentPayload = {
//     publicId: RequestDocument.publicId,
//     firstName: RequestDocument.firstName,
//     lastName: RequestDocument.lastName,
//     idcs: RequestDocument.idcs,
//     address: RequestDocument.address,
//     email: RequestDocument.email,
//     maritalStatus: RequestDocument.maritalStatus, // attention à bien utiliser la clé correcte
//     cin: RequestDocument.cin,
//     phone: RequestDocument.phone,
//     gender: RequestDocument.gender,
//     dateBirth:
//       typeof RequestDocument.dateBirth === 'string'
//         ? RequestDocument.dateBirth
//         : new Date(RequestDocument.dateBirth!).toISOString().split('T')[0], // yyyy-MM-dd
//   };
//    // ✅ Envoyer le JSON stringifié
//   formData.append('RequestDocument', JSON.stringify(RequestDocumentPayload));

//   if (file) {
//     formData.append('imageUrl', file);
//   }

//   return this.http.patch<RequestDocument>(`${environment.API_URL}/RequestDocuments/update`, formData).subscribe({
//     next: (res: RequestDocument) => {
//       this.create$.next(State.Builder<RequestDocument>().forSuccess(res));
//     },
//     error: (err: HttpErrorResponse) => this.create$.next(State.Builder<any>().forError(err)),
//   });
// }

// deleteRequestDocumentBulk(publicIds: string[]): void {
//   this.http
//     .request<string[]>('delete', `${environment.API_URL}/RequestDocuments/bulk`, {
//       body: publicIds,
//       headers: new HttpHeaders({
//         'Content-Type': 'application/json',
//       }),
//     })
//     .subscribe({
//       next: (res: string[]) => {
//         this.delete$.next(State.Builder<string[]>().forSuccess(res));
//       },
//       error: (err) => {
//         this.delete$.next(State.Builder<any>().forError(err));
//       },
//     });
// }
