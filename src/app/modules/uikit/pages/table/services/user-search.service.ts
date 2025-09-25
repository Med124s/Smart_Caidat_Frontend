import { Pagination } from './../../../../../shared/models/request.model';
import { SearchResponse } from './../../../../complaint/model/complaint-search';
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, of, startWith } from 'rxjs';
import { State } from 'src/app/shared/models/state.model';
import { RegisterUser } from 'src/app/shared/models/user.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserSearchService {
  // http = inject(HttpClient);

  // private searchQuery$ = new Subject<SearchQuery>();
  // // private searchResult$ = new Subject<State<Array<RegisterUser>>>();
  // private searchResult$ = new Subject<State<SearchResponse>>();

  // // searchResult = this.searchResult$.asObservable();
  // searchResult = this.searchResult$.asObservable(); // type : Observable<State<SearchResponse>>

  // private create$ = new Subject<State<RegisterUser>>();
  // create = this.create$.asObservable();
  // private delete$ = new Subject<State<string[]>>();
  // delete = this.delete$.asObservable();

  // constructor() {
  //   this.listenToSearch();
  // }

  // private listenToSearch(): void {
  //   this.searchQuery$
  //     .pipe(
  //       distinctUntilChanged(),
  //       debounce(() => timer(300)),
  //       switchMap((query) =>
  //         this.fetchResult(query).pipe(
  //           catchError((err) => {
  //             this.searchResult$.next(State.Builder<SearchResponse>().forError(err));
  //             return of({ users: [], currentPage: 0, totalItems: 0, totalPages: 0 });
  //           }),
  //         ),
  //       ),
  //     )
  //     .subscribe({
  //       next: (res) => this.searchResult$.next(State.Builder<SearchResponse>().forSuccess(res)),
  //       error: (err) => this.searchResult$.next(State.Builder<SearchResponse>().forError(err)),
  //     });
  // }

  // // private fetchResult(searchQuery: SearchQuery): Observable<Array<RegisterUser>> {
  // //   let params = createPaginationOption(searchQuery.page);
  // //   params = params.set('query', searchQuery.query);
  // //   return this.http.get<Array<RegisterUser>>(`${environment.API_URL}/users/search`, { params });
  // // }

  // private fetchResult(searchQuery: SearchQuery): Observable<SearchResponse> {
  //   let params = createPaginationOption(searchQuery.page);
  //   params = params.set('query', searchQuery.query);
  //   return this.http.get<SearchResponse>(`${environment.API_URL}/users/search`, { params });
  // }

  // search(searchQuery: SearchQuery): void {
  //   this.searchQuery$.next(searchQuery);
  // }

  // saveUser(user: RegisterUser, file?: File) {
  //   const formData = new FormData();

  //   // On envoie les infos en JSON string
  //   formData.append(
  //     'user',
  //     JSON.stringify({
  //       publicId: user.publicId,
  //       firstName: user.firstName,
  //       lastName: user.lastName,
  //       email: user.email,
  //       authorities: user.authorities,
  //       password: user.password,
  //     }),
  //   );
  //   if (file) {
  //     formData.append('imageUrl', file); // le fichier image
  //   }

  //   // return this.http.post<string>(`${environment.API_URL}/users/register`, formData).subscribe({
  //   //   next: (res: string) => {
  //   //     this.create$.next(State.Builder<string>().forSuccess(res));
  //   //   },
  //   //   error: (err: any) => this.create$.next(State.Builder<any>().forError(err)),
  //   // });

  //   return  this.http.post<{ user: RegisterUser }>(`${environment.API_URL}/users/register`, formData)
  //   .subscribe({
  //     next: (res) => {
  //       // ✅ Corrigé : on passe bien un RegisterUser
  //       this.create$.next(State.Builder<RegisterUser>().forSuccess(res.user));
  //     },
  //     error: (err: HttpErrorResponse) => {
  //       this.create$.next(State.Builder<RegisterUser>().forError(err));
  //     }
  //   });
  // }

  // updateUser(user: RegisterUser, file?: File) {
  //   const formData = new FormData();
  //   // On envoie les infos en JSON string
  //   formData.append(
  //     'user',
  //     JSON.stringify({
  //       publicId: user.publicId,
  //       firstName: user.firstName,
  //       lastName: user.lastName,
  //       email: user.email,
  //       authorities: user.authorities,
  //       imageUrl: user.imageUrl,
  //       password: user.password,
  //     }),
  //   );
  //   if (file) {
  //     formData.append('imageUrl', file); // le fichier image
  //   }
  //   return this.http.patch<RegisterUser>(`${environment.API_URL}/users/update`, formData).subscribe({
  //     next: (res: RegisterUser) => {
  //       this.create$.next(State.Builder<RegisterUser>().forSuccess(res));
  //     },
  //     error: (err: HttpErrorResponse) => this.create$.next(State.Builder<any>().forError(err)),
  //   });
  // }

  // deleteUsersBulk(publicIds: string[]) {
  //   return this.http
  //     .request<string[]>('delete', `${environment.API_URL}/users/bulk`, {
  //       body: publicIds,
  //       headers: new HttpHeaders({
  //         'Content-Type': 'application/json',
  //       }),
  //     })
  //     .subscribe({
  //       next: (res:string[]) => {
  //         this.delete$.next(State.Builder<string[]>().forSuccess(res));
  //       },
  //       error: (err: any) => this.delete$.next(State.Builder<any>().forError(err)),
  //     });
  // }

  // http = inject(HttpClient);

  // private searchQuery$ = new Subject<SearchQuery>();
  // private searchResult$ = new Subject<State<SearchResponse>>();
  // searchResult = this.searchResult$.asObservable();

  // constructor() {
  //   this.listenToSearch();
  // }

  // private listenToSearch(): void {
  //   this.searchQuery$
  //     .pipe(
  //       distinctUntilChanged(),
  //       debounce(() => timer(300)),
  //       switchMap((query) =>
  //         this.fetchResult(query).pipe(
  //           map((res) => State.Builder<SearchResponse>().forSuccess(res)),
  //           catchError((err) => of(State.Builder<SearchResponse>().forError(err))),
  //         ),
  //       ),
  //     )
  //     .subscribe((state) => this.searchResult$.next(state));
  // }

  // private fetchResult(searchQuery: SearchQuery): Observable<SearchResponse> {
  //   let params = createPaginationOption(searchQuery.page);
  //   params = params.set('query', searchQuery.query);
  //   return this.http.get<SearchResponse>(`${environment.API_URL}/users/search`, { params });
  // }

  // search(searchQuery: SearchQuery): void {
  //   this.searchQuery$.next(searchQuery);
  // }

  // saveUser(user: RegisterUser, file?: File): Observable<State<RegisterUser>> {
  //   const formData = new FormData();
  //   formData.append(
  //     'user',
  //     JSON.stringify({
  //       publicId: user.publicId,
  //       firstName: user.firstName,
  //       lastName: user.lastName,
  //       email: user.email,
  //       authorities: user.authorities,
  //       password: user.password,
  //     }),
  //   );
  //   if (file) {
  //     formData.append('imageUrl', file);
  //   }

  //   return this.http.post<{ user: RegisterUser }>(`${environment.API_URL}/users/register`, formData).pipe(
  //     map((res) => {
  //       const mapped = this.mapToRegisterUser(res.user);
  //       return State.Builder<RegisterUser>().forSuccess(mapped);
  //     }),
  //     catchError((err: HttpErrorResponse) => of(State.Builder<RegisterUser>().forError(err))),
  //   );
  // }

  // updateUser(user: RegisterUser, file?: File): Observable<State<RegisterUser>> {
  //   const formData = new FormData();
  //   formData.append(
  //     'user',
  //     JSON.stringify({
  //       publicId: user.publicId,
  //       firstName: user.firstName,
  //       lastName: user.lastName,
  //       email: user.email,
  //       authorities: user.authorities,
  //       imageUrl: user.imageUrl,
  //       password: user.password,
  //     }),
  //   );
  //   if (file) {
  //     formData.append('imageUrl', file);
  //   }

  //   return this.http.patch<RegisterUser>(`${environment.API_URL}/users/update`, formData).pipe(
  //     map((res) => State.Builder<RegisterUser>().forSuccess(res)),
  //     catchError((err: HttpErrorResponse) => of(State.Builder<RegisterUser>().forError(err))),
  //   );
  // }

  // private mapToRegisterUser(raw: any): RegisterUser {
  //   if (!raw) return {} as RegisterUser;

  //   return {
  //     publicId: raw.userPublicId?.value || '',
  //     firstName: raw.firstname?.value || '',
  //     lastName: raw.lastName?.value || '',
  //     email: raw.email?.value || '',
  //     password: raw.password?.value || '',
  //     imageUrl: raw.imageUrl?.value || '',
  //     authorities: raw.authorities || [],
  //     lastSeen: raw.lastSeen || null,
  //   };
  // }

  // deleteUsersBulk(publicIds: string[]): Observable<State<string[]>> {
  //   return this.http
  //     .request<string[]>('delete', `${environment.API_URL}/users/bulk`, {
  //       body: publicIds,
  //       headers: new HttpHeaders({
  //         'Content-Type': 'application/json',
  //       }),
  //     })
  //     .pipe(
  //       map((res) => State.Builder<string[]>().forSuccess(res)),
  //       catchError((err: HttpErrorResponse) => of(State.Builder<string[]>().forError(err))),
  //     );
  // }

  private http = inject(HttpClient);

  // search(query: string, pagination: Pagination): Observable<State<SearchResponse<Complaint>>> {
  //   const params = new HttpParams()
  //     .set('keyword', query)
  //     .set('page', pagination.page.toString())
  //     .set('size', pagination.size.toString())
  //     .set('sort', pagination.sort.join(','));

  /** 🔹 Rechercher les utilisateurs avec pagination */
  search(query: string, pagination: Pagination): Observable<State<SearchResponse<RegisterUser>>> {
    // const params = new HttpParams().set('query', query).set('page', page.toString()).set('size', size.toString());
    const params = new HttpParams()
      .set('keyword', query)
      .set('page', pagination.page.toString())
      .set('size', pagination.size.toString())
      .set('sort', pagination.sort.join(','));

    return this.http.get<SearchResponse<RegisterUser>>(`${environment.API_URL}/users/search`, { params }).pipe(
      map((res: any) => State.Builder<SearchResponse<RegisterUser>>().forSuccess(res)),
      startWith(State.Builder<SearchResponse<RegisterUser>>().forInit()),
      catchError((err) => of(State.Builder<SearchResponse<RegisterUser>>().forError(err))),
    );
  }

  /** 🔹 Créer un nouvel utilisateur */
  create(user: RegisterUser, file?: File): Observable<State<RegisterUser>> {
    const formData = new FormData();
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
      formData.append('imageUrl', file);
    }

    return this.http.post<RegisterUser>(`${environment.API_URL}/users/register`, formData).pipe(
      map((res: any) => State.Builder<RegisterUser>().forSuccess(this.mapToRegisterUser(res.user))),
      startWith(State.Builder<RegisterUser>().forInit()),
      catchError((err: HttpErrorResponse) => of(State.Builder<RegisterUser>().forError(err))),
    );
  }

  private mapToRegisterUser(raw: any): RegisterUser {
    if (!raw) return {} as RegisterUser;

    if (Array.isArray(raw.authorities)) {
      raw.authorities = raw.authorities.map(
        (auth: any) =>
          typeof auth === 'string'
            ? auth // déjà bon
            : auth?.name?.name, // cas { name: { name: 'ROLE_XXX' } }
      );
    }

    return {
      publicId: raw.userPublicId?.value || '',
      firstName: raw.firstname?.value || '',
      lastName: raw.lastName?.value || '',
      email: raw.email?.value || '',
      password: raw.password?.value || '',
      imageUrl: raw.imageUrl?.value || '',
      authorities: raw.authorities || [],
      lastSeen: raw.lastSeen || null,
    };
  }

  /** 🔹 Mettre à jour un utilisateur */
  update(user: RegisterUser, file?: File): Observable<State<RegisterUser>> {
    console.log('....... FILE ......');

    console.log(file);

    const formData = new FormData();
    formData.append(
      'user',
      JSON.stringify({
        publicId: user.publicId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        authorities: user.authorities,
        password: user.password,
        imageUrl: user.imageUrl,
      }),
    );
    if (file) {
      formData.append('imageUrl', file);
    }

    return this.http.patch<RegisterUser>(`${environment.API_URL}/users/update`, formData).pipe(
      map((res: any) => {
        console.log(res);
        return State.Builder<RegisterUser>().forSuccess(res.user);
      }),
      startWith(State.Builder<RegisterUser>().forInit()),
      catchError((err: HttpErrorResponse) => of(State.Builder<RegisterUser>().forError(err))),
    );
  }

  /** 🔹 Supprimer plusieurs utilisateurs */
  deleteUsersBulk(publicIds: string[]): Observable<State<string[]>> {
    return this.http
      .request<string[]>('delete', `${environment.API_URL}/users/bulk`, {
        body: publicIds,
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      })
      .pipe(
        map((res) => State.Builder<string[]>().forSuccess(res)),
        startWith(State.Builder<string[]>().forInit()),
        catchError((err: HttpErrorResponse) => of(State.Builder<string[]>().forError(err))),
      );
  }
}
