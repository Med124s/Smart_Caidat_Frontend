import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, debounce, distinctUntilChanged, Observable, of, Subject, switchMap, timer } from 'rxjs';
import { SearchQuery, SearchResponse } from '../model/user-search.model';
import { State } from 'src/app/shared/models/state.model';
import {  RegisterUser } from 'src/app/shared/models/user.model';
import { createPaginationOption } from 'src/app/shared/models/request.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserSearchService {
  http = inject(HttpClient);

  private searchQuery$ = new Subject<SearchQuery>();
  // private searchResult$ = new Subject<State<Array<RegisterUser>>>();
  private searchResult$ = new Subject<State<SearchResponse>>();

  // searchResult = this.searchResult$.asObservable();
  searchResult = this.searchResult$.asObservable(); // type : Observable<State<SearchResponse>>

  private create$ = new Subject<State<RegisterUser>>();
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
              this.searchResult$.next(State.Builder<SearchResponse>().forError(err));
              return of({ users: [], currentPage: 0, totalItems: 0, totalPages: 0 });
            }),
          ),
        ),
      )
      .subscribe({
        next: (res) => this.searchResult$.next(State.Builder<SearchResponse>().forSuccess(res)),
        error: (err) => this.searchResult$.next(State.Builder<SearchResponse>().forError(err)),
      });
  }

  // private fetchResult(searchQuery: SearchQuery): Observable<Array<RegisterUser>> {
  //   let params = createPaginationOption(searchQuery.page);
  //   params = params.set('query', searchQuery.query);
  //   return this.http.get<Array<RegisterUser>>(`${environment.API_URL}/users/search`, { params });
  // }

  private fetchResult(searchQuery: SearchQuery): Observable<SearchResponse> {
    let params = createPaginationOption(searchQuery.page);
    params = params.set('query', searchQuery.query);
    return this.http.get<SearchResponse>(`${environment.API_URL}/users/search`, { params });
  }

  search(searchQuery: SearchQuery): void {
    this.searchQuery$.next(searchQuery);
  }

  saveUser(user: RegisterUser, file?: File) {
    const formData = new FormData();

    // On envoie les infos en JSON string
    formData.append(
      'user',
      JSON.stringify({
        publicId: user.publicId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        authorities: user.authorities,
        password: user.password,
      }),
    );
    if (file) {
      formData.append('imageUrl', file); // le fichier image
    }

    // return this.http.post<string>(`${environment.API_URL}/users/register`, formData).subscribe({
    //   next: (res: string) => {
    //     this.create$.next(State.Builder<string>().forSuccess(res));
    //   },
    //   error: (err: any) => this.create$.next(State.Builder<any>().forError(err)),
    // });

    return  this.http.post<{ user: RegisterUser }>(`${environment.API_URL}/users/register`, formData)
    .subscribe({
      next: (res) => {
        // ✅ Corrigé : on passe bien un RegisterUser
        this.create$.next(State.Builder<RegisterUser>().forSuccess(res.user));
      },
      error: (err: HttpErrorResponse) => {
        this.create$.next(State.Builder<RegisterUser>().forError(err));
      }
    });
  }

  updateUser(user: RegisterUser, file?: File) {
    const formData = new FormData();
    // On envoie les infos en JSON string
    formData.append(
      'user',
      JSON.stringify({
        publicId: user.publicId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        authorities: user.authorities,
        imageUrl: user.imageUrl,
        password: user.password,
      }),
    );
    if (file) {
      formData.append('imageUrl', file); // le fichier image
    }
    return this.http.patch<RegisterUser>(`${environment.API_URL}/users/update`, formData).subscribe({
      next: (res: RegisterUser) => {
        this.create$.next(State.Builder<RegisterUser>().forSuccess(res));
      },
      error: (err: HttpErrorResponse) => this.create$.next(State.Builder<any>().forError(err)),
    });
  }

  deleteUsersBulk(publicIds: string[]) {
    return this.http
      .request<string[]>('delete', `${environment.API_URL}/users/bulk`, {
        body: publicIds,
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .subscribe({
        next: (res:string[]) => {
          this.delete$.next(State.Builder<string[]>().forSuccess(res));
        },
        error: (err: any) => this.delete$.next(State.Builder<any>().forError(err)),
      });
  }
}
