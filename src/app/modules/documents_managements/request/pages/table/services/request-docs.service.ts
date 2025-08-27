import { SearchQuery } from './../../../../../uikit/pages/table/model/user-search.model';
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  debounce,
  distinctUntilChanged,
  Observable,
  of,
  Subject,
  switchMap,
  timer,
} from 'rxjs';
import { State } from 'src/app/shared/models/state.model';
import { createPaginationOption } from 'src/app/shared/models/request.model';
import { environment } from 'src/environments/environment';
// import {  SearchResponse } from '../../../model/citoyen-search.model';
import { Archive } from 'src/app/modules/documents_managements/archive_document/model/archive.model';
import { RequestDocument } from '../../../model/request.model';
import { SearchResponse } from 'src/app/modules/citoyen/model/citoyen-search.model';

@Injectable({
  providedIn: 'root',
})
export class RequestSearchService {
  private http = inject(HttpClient);

  private searchQuery$ = new Subject<SearchQuery>();
  private searchResult$ = new Subject<State<SearchResponse<Archive>>>();
  searchResult = this.searchResult$.asObservable();

  private requestsByCitizen$ = new Subject<{ citizenPublicId: string; searchQuery: SearchQuery }>();

  private searchRequestByCitizen$ = new Subject<State<SearchResponse<RequestDocument>>>();
  searchResultByCitizen = this.searchRequestByCitizen$.asObservable();


  // private create$ = new Subject<State<Archive>>();
  // create = this.create$.asObservable();

  //  ✅ بدل Subject بـ BehaviorSubject باش يحتافظ بالقيمة الأخيرة
  private create$ = new BehaviorSubject<State<Archive>>(State.Builder<Archive>().forInit());
  create = this.create$.asObservable();

  private delete$ = new Subject<State<string[]>>();
  delete = this.delete$.asObservable();

  constructor() {
    this.listenToSearch();
    this.listenToFetchRequestByCitizen();
  }

  private listenToSearch(): void {
    this.searchQuery$
      .pipe(
        distinctUntilChanged(),
        debounce(() => timer(300)),
        switchMap((query) =>
          this.fetchResult(query).pipe(
            catchError((err) => {
              this.searchResult$.next(State.Builder<SearchResponse<Archive>>().forError(err));
              return of({ data: [], currentPage: 0, totalItems: 0, totalPages: 0 });
            }),
          ),
        ),
      )
      .subscribe({
        next: (res) => this.searchResult$.next(State.Builder<SearchResponse<Archive>>().forSuccess(res)),
        error: (err) => this.searchResult$.next(State.Builder<SearchResponse<Archive>>().forError(err)),
      });
  }

private listenToFetchRequestByCitizen(): void {
  this.requestsByCitizen$
    .pipe(
      distinctUntilChanged(),
      debounce(() => timer(300)),
      switchMap(({ citizenPublicId, searchQuery }) =>
        this.fetchRequestsByCitizen(citizenPublicId, searchQuery).pipe(
          catchError((err) => {
            this.searchRequestByCitizen$.next(
              State.Builder<SearchResponse<RequestDocument>>().forError(err)
            );
            return of({ data: [], currentPage: 0, totalItems: 0, totalPages: 0 });
          })
        )
      )
    )
    .subscribe({
      next: (res) =>
        this.searchRequestByCitizen$.next(
          State.Builder<SearchResponse<RequestDocument>>().forSuccess(res)
        ),
      error: (err) =>
        this.searchRequestByCitizen$.next(
          State.Builder<SearchResponse<RequestDocument>>().forError(err)
        ),
    });
}


  private fetchResult(searchQuery: SearchQuery): Observable<SearchResponse<Archive>> {
    let params = createPaginationOption(searchQuery.page);
    params = params.set('query', searchQuery.query);
    return this.http.get<SearchResponse<Archive>>(`${environment.API_URL}/requests/findByArchive`, { params });
  }

  searchRequest(searchQuery: SearchQuery): void {
    this.searchQuery$.next(searchQuery);
  }

  triggerFetchRequestsByCitizen(citizenPublicId: string, searchQuery: SearchQuery) {
  this.requestsByCitizen$.next({ citizenPublicId, searchQuery });
}

  fetchRequestsByCitizen(citizenPublicId: string, searchQuery: SearchQuery): Observable<SearchResponse<RequestDocument>> {
  let params = createPaginationOption(searchQuery.page);
  params = params.set('citizenPublicId', citizenPublicId);
  
  
  if (searchQuery.query) {
    params = params.set('query', searchQuery.query);
  }
    console.log("FRONTEND CALLING API fetchRequestsByCitizen");

  return this.http.get<SearchResponse<RequestDocument>>(
    `${environment.API_URL}/requests/findByCitizen`,
    { params }
  );
}

  // fetchRequestsByArchive(ArchivePublicId: string) {
  //   let params = createPaginationOption(searchQuery.page);
  //   params = params.set('query', searchQuery.query);
  //   return this.http.get<SearchResponse<Archive>>(`${environment.API_URL}/requests/findByArchive`, { params });
  // }

  // saveArchive(Archive: Archive, file?: File): void {
  //   const formData = new FormData();
  //   const ArchivePayload = {
  //     publicId: Archive.publicId,
  //     firstName: Archive.firstName,
  //     lastName: Archive.lastName,
  //     idcs: Archive.idcs,
  //     address: Archive.address,
  //     email: Archive.email,
  //     maritalStatus: Archive.maritalStatus, // attention à bien utiliser la clé correcte
  //     cin: Archive.cin,
  //     phone: Archive.phone,
  //     gender: Archive.gender,
  //     dateBirth:
  //       typeof Archive.dateBirth === 'string'
  //         ? Archive.dateBirth
  //         : new Date(Archive.dateBirth!).toISOString().split('T')[0], // yyyy-MM-dd
  //   };
  //   // ✅ Envoyer le JSON stringifié
  //   formData.append('Archive', JSON.stringify(ArchivePayload));
  //   if (file) {
  //     formData.append('imageUrl', file);
  //   }
  //   this.http.post<Archive>(`${environment.API_URL}/Archives/register`, formData).subscribe({
  //     next: (res) => this.create$.next(State.Builder<Archive>().forSuccess(res)),
  //     error: (err: HttpErrorResponse) => this.create$.next(State.Builder<Archive>().forError(err)),
  //   });
  // }

  // updateArchive(Archive: Archive, file?: File) {
  //   const formData = new FormData();

  //   const ArchivePayload = {
  //     publicId: Archive.publicId,
  //     firstName: Archive.firstName,
  //     lastName: Archive.lastName,
  //     idcs: Archive.idcs,
  //     address: Archive.address,
  //     email: Archive.email,
  //     maritalStatus: Archive.maritalStatus, // attention à bien utiliser la clé correcte
  //     cin: Archive.cin,
  //     phone: Archive.phone,
  //     gender: Archive.gender,
  //     dateBirth:
  //       typeof Archive.dateBirth === 'string'
  //         ? Archive.dateBirth
  //         : new Date(Archive.dateBirth!).toISOString().split('T')[0], // yyyy-MM-dd
  //   };
  //    // ✅ Envoyer le JSON stringifié
  //   formData.append('Archive', JSON.stringify(ArchivePayload));

  //   if (file) {
  //     formData.append('imageUrl', file);
  //   }

  //   return this.http.patch<Archive>(`${environment.API_URL}/Archives/update`, formData).subscribe({
  //     next: (res: Archive) => {
  //       this.create$.next(State.Builder<Archive>().forSuccess(res));
  //     },
  //     error: (err: HttpErrorResponse) => this.create$.next(State.Builder<any>().forError(err)),
  //   });
  // }

  // deleteArchiveBulk(publicIds: string[]): void {
  //   this.http
  //     .request<string[]>('delete', `${environment.API_URL}/Archives/bulk`, {
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
}
