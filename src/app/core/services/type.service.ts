import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TypeResponse } from './models/response/TypeResponse';
import { PageResponse } from './models/response/PageResponse';
import { TypeRequest } from './models/request/TypeRequest';

@Injectable({
  providedIn: 'root'
})
export class TypeService {

  private baseUrl = `${environment.API_BASE_URL}/type_correspondances`;
  constructor(private http: HttpClient) { }

search(page: number, limit: number, keyword: string = ''): Observable<HttpResponse<PageResponse<TypeResponse>>> {
  let params = new HttpParams()
    .set('_page', page)
    .set('_limit', limit);

  if (keyword) {
    params = params.set('keyword', keyword);
  }

  return this.http.get<PageResponse<TypeResponse>>(`${this.baseUrl}`, {
    params,
    observe: 'response'
  });
}

save(request: TypeRequest): Observable<TypeResponse> {
  return this.http.post<any>(`${this.baseUrl}`, request);
}

delete(id: number){
  return this.http.delete<void>(`${this.baseUrl}/${id}`);
}

update(id: number, request: TypeRequest){
  return this.http.put<any>(`${this.baseUrl}/${id}`, request);
}

getAll() {
  return this.http.get<TypeResponse[]>(`${this.baseUrl}/all`);
}

deleteMany(ids: number[]) {
  return this.http.post<any>(`${this.baseUrl}/delete`, ids);
}

}
