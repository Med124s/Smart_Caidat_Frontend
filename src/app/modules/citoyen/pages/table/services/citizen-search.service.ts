import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, debounce, distinctUntilChanged, Observable, of, Subject, switchMap, timer } from 'rxjs';
import { State } from 'src/app/shared/models/state.model';
import { createPaginationOption } from 'src/app/shared/models/request.model';
import { environment } from 'src/environments/environment';
import { Citizen } from '../../../model/citoyen.model';
import { SearchQuery, SearchResponse } from '../../../model/citoyen-search.model';

@Injectable({
  providedIn: 'root',
})
export class CitizenSearchService {
  private http = inject(HttpClient);

  private searchQuery$ = new Subject<SearchQuery>();
  private searchResult$ = new Subject<State<SearchResponse<Citizen>>>();
  searchResult = this.searchResult$.asObservable();

  // private create$ = new Subject<State<Citizen>>();
  // create = this.create$.asObservable();


  //  ✅ بدل Subject بـ BehaviorSubject باش يحتافظ بالقيمة الأخيرة
  private create$ = new BehaviorSubject<State<Citizen>>(State.Builder<Citizen>().forInit());
  create = this.create$.asObservable();


  private delete$ = new Subject<State<string[]>>();
  delete = this.delete$.asObservable();

  constructor() {
    this.listenToSearch();
  }

  private listenToSearch(): void {
    this.searchQuery$
      .pipe(
        distinctUntilChanged(),
        debounce(() => timer(300)),
        switchMap((query) =>
          this.fetchResult(query).pipe(
            catchError((err) => {
              this.searchResult$.next(State.Builder<SearchResponse<Citizen>>().forError(err));
              return of({ data: [], currentPage: 0, totalItems: 0, totalPages: 0 });
            }),
          ),
        ),
      )
      .subscribe({
        next: (res) => this.searchResult$.next(State.Builder<SearchResponse<Citizen>>().forSuccess(res)),
        error: (err) => this.searchResult$.next(State.Builder<SearchResponse<Citizen>>().forError(err)),
      });
  }

  private fetchResult(searchQuery: SearchQuery): Observable<SearchResponse<Citizen>> {
    let params = createPaginationOption(searchQuery.page);
    params = params.set('query', searchQuery.query);
    return this.http.get<SearchResponse<Citizen>>(`${environment.API_URL}/citizens/search`, { params });
  }

  searchCitizen(searchQuery: SearchQuery): void {
    this.searchQuery$.next(searchQuery);
  }

  saveCitizen(citizen: Citizen, file?: File): void {
    const formData = new FormData();
    const citizenPayload = {
      publicId: citizen.publicId,
      firstName: citizen.firstName,
      lastName: citizen.lastName,
      idcs: citizen.idcs,
      address: citizen.address,
      email: citizen.email,
      maritalStatus: citizen.maritalStatus, // attention à bien utiliser la clé correcte
      cin: citizen.cin,
      phone: citizen.phone,
      gender: citizen.gender,
      dateBirth:
        typeof citizen.dateBirth === 'string'
          ? citizen.dateBirth
          : new Date(citizen.dateBirth!).toISOString().split('T')[0], // yyyy-MM-dd
    };
    // ✅ Envoyer le JSON stringifié
    formData.append('citizen', JSON.stringify(citizenPayload));
    if (file) {
      formData.append('imageUrl', file);
    }
    this.http.post<Citizen>(`${environment.API_URL}/citizens/register`, formData).subscribe({
      next: (res) => this.create$.next(State.Builder<Citizen>().forSuccess(res)),
      error: (err: HttpErrorResponse) => this.create$.next(State.Builder<Citizen>().forError(err)),
    });
  }

  updateCitizen(citizen: Citizen, file?: File) {
    const formData = new FormData();

    const citizenPayload = {
      publicId: citizen.publicId,
      firstName: citizen.firstName,
      lastName: citizen.lastName,
      idcs: citizen.idcs,
      address: citizen.address,
      email: citizen.email,
      maritalStatus: citizen.maritalStatus, // attention à bien utiliser la clé correcte
      cin: citizen.cin,
      phone: citizen.phone,
      gender: citizen.gender,
      dateBirth:
        typeof citizen.dateBirth === 'string'
          ? citizen.dateBirth
          : new Date(citizen.dateBirth!).toISOString().split('T')[0], // yyyy-MM-dd
    };
     // ✅ Envoyer le JSON stringifié
    formData.append('citizen', JSON.stringify(citizenPayload));

    if (file) {
      formData.append('imageUrl', file);
    }

    return this.http.patch<Citizen>(`${environment.API_URL}/citizens/update`, formData).subscribe({
      next: (res: Citizen) => {
        this.create$.next(State.Builder<Citizen>().forSuccess(res));
      },
      error: (err: HttpErrorResponse) => this.create$.next(State.Builder<any>().forError(err)),
    });
  }

  deletecitizenBulk(publicIds: string[]): void {
    this.http
      .request<string[]>('delete', `${environment.API_URL}/citizens/bulk`, {
        body: publicIds,
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .subscribe({
        next: (res: string[]) => {
          this.delete$.next(State.Builder<string[]>().forSuccess(res));
        },
        error: (err) => {
          this.delete$.next(State.Builder<any>().forError(err));
        },
      });
  }
}
