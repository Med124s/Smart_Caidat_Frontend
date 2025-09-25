import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PageResponse } from './models/response/PageResponse';
import { MeetingResponse } from './models/response/MeetingResponse';
import { MeetingRequest } from './models/request/MeetingRequest';

@Injectable({
  providedIn: 'root'
})
export class MeetingService {

  private baseUrl = `${environment.API_BASE_URL}/meetings`;
  constructor(private http: HttpClient) { }

  search(page: number, limit: number, keyword: string = '', dateMeeting: string = ''): Observable<HttpResponse<PageResponse<MeetingResponse>>> {
    
    let params = new HttpParams()
      .set('_page', page)
      .set('_limit', limit);
    
    if (keyword) {
      params = params.set('keyword', keyword);
    }

    if (dateMeeting) {
      params = params.set('dateMeeting', dateMeeting);
    }

      return this.http.get<PageResponse<MeetingResponse>>(`${this.baseUrl}`, {
        params,
        observe: 'response'
      });
  }

  
  save(request: MeetingRequest): Observable<any> {
    request.dateMeeting = `${request.dateMeeting}T${request.timeMeeting}:00`;
    return this.http.post<any>(this.baseUrl, request);
  }

delete(id: number){
  return this.http.delete<void>(`${this.baseUrl}/${id}`);
}

deleteParticipant(id: number){
  return this.http.delete<void>(`${this.baseUrl}/participant/${id}`);
}

update(id: number, request: MeetingRequest){
  request.dateMeeting = `${request.dateMeeting}T${request.timeMeeting}:00`;
  return this.http.put<any>(`${this.baseUrl}/${id}`, request);
}

deleteMany(ids: number[]) {
  return this.http.post<any>(`${this.baseUrl}/delete`, ids);
}
}