import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PageResponse } from './models/response/PageResponse';
import { SalleResponse } from './models/response/SalleResponse';
import { SalleRequest } from './models/request/SalleRequest';

@Injectable({
  providedIn: 'root'
})
export class SalleService {

  private baseUrl = `${environment.API_BASE_URL}/salles`;
  constructor(private http: HttpClient) { }

search(page: number, limit: number, keyword: string = ''): Observable<HttpResponse<PageResponse<SalleResponse>>> {
  let params = new HttpParams()
    .set('_page', page)
    .set('_limit', limit);

  if (keyword) {
    params = params.set('keyword', keyword);
  }

  return this.http.get<PageResponse<SalleResponse>>(`${this.baseUrl}`, {
    params,
    observe: 'response'
  });
}

save(request: SalleRequest): Observable<SalleResponse> {
  return this.http.post<any>(`${this.baseUrl}`, request);
}

delete(id: number){
  return this.http.delete<void>(`${this.baseUrl}/${id}`);
}

update(id: number, request: SalleRequest){
  return this.http.put<any>(`${this.baseUrl}/${id}`, request);
}

getAll() {
  return this.http.get<SalleResponse[]>(`${this.baseUrl}/all`);
}

deleteMany(ids: number[]) {
  return this.http.post<any>(`${this.baseUrl}/delete`, ids);
}

}
