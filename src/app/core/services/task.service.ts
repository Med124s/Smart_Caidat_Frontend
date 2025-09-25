import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PageResponse } from './models/response/PageResponse';
import { TaskResponse } from './models/response/TaskResponse';
import { TaskRequest } from './models/request/TaskRequet';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private baseUrl = `${environment.API_BASE_URL}/tasks`;
  constructor(private http: HttpClient) { }

search(page: number, limit: number, keyword: string = ''): Observable<HttpResponse<PageResponse<TaskResponse>>> {
  let params = new HttpParams()
    .set('_page', page)
    .set('_limit', limit);

  if (keyword) {
    params = params.set('keyword', keyword);
  }

  return this.http.get<PageResponse<TaskResponse>>(`${this.baseUrl}`, {
    params,
    observe: 'response'
  });
}

save(request: TaskRequest): Observable<TaskResponse> {
  return this.http.post<any>(`${this.baseUrl}`, request);
}

delete(id: number){
  return this.http.delete<void>(`${this.baseUrl}/${id}`);
}

update(id: number, request: TaskRequest){
  return this.http.put<any>(`${this.baseUrl}/${id}`, request);
}

updateStatus(id: number, request: TaskRequest){
  return this.http.put<any>(`${this.baseUrl}/update_status/${id}`, request);
}

deleteMany(ids: number[]) {
  return this.http.post<any>(`${this.baseUrl}/delete`, ids);
}

uploadFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/upload`, formData, { responseType: 'text' });
 }

 download(filename: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/download/${filename}`, {
      responseType: 'blob'
    });
}

nombreTaskTodo(status: string = ''): Observable<number> {
  let params = new HttpParams()
    .set('status', status);
  return this.http.get<number>(`${this.baseUrl}/todo`, {
    params
  });
}

}
