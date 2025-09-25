import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PageResponse } from './models/response/PageResponse';
import { CorrespondanceResponse } from './models/response/CorrespondanceResponse';
import { CorrespondanceRequest } from './models/request/CorrespondanceRequest';

@Injectable({
  providedIn: 'root'
})
export class CorrespondanceService {
  private baseUrl = `${environment.API_BASE_URL}/correspondances`;

  constructor(private http: HttpClient) { }  

  search(page: number, limit: number, keyword: string = ''): Observable<HttpResponse<PageResponse<CorrespondanceResponse>>> {
    
    let params = new HttpParams()
      .set('_page', page)
      .set('_limit', limit);
    
    if (keyword) {
      params = params.set('keyword', keyword);
    }

      return this.http.get<PageResponse<CorrespondanceResponse>>(`${this.baseUrl}`, {
        params,
        observe: 'response'
      });
  }

  
save(request: CorrespondanceRequest): Observable<any> {
    return this.http.post<any>(this.baseUrl, request);
  }

  
update(id: number, request: CorrespondanceRequest): Observable<any> {
  return this.http.put<any>(`${this.baseUrl}/${id}`, request);
}

delete(id: number): Observable<void> {
  return this.http.delete<void>(`${this.baseUrl}/${id}`);
}

deleteMany(ids: number[]) {
  return this.http.post<any>(`${this.baseUrl}/delete`, ids);
}

}
