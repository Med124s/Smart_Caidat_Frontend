import { UpdateComplaintDTO } from './../../../model/complaint.model';
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SearchResponse } from '../../../model/complaint-search';
import { catchError, map, Observable, of, startWith } from 'rxjs';
import { State } from 'src/app/shared/models/state.model';
import { environment } from 'src/environments/environment';
import { Complaint, ComplaintStatus, CreateComplaintDTO } from '../../../model/complaint.model';
import { Pagination } from 'src/app/shared/models/request.model';

@Injectable({
  providedIn: 'root',
})
export class ComplaintService {
  private http = inject(HttpClient);
  // private notificationService = inject(NotificationService);

  search(query: string, pagination: Pagination): Observable<State<SearchResponse<Complaint>>> {
    const params = new HttpParams()
      .set('keyword', query)
      .set('page', pagination.page.toString())
      .set('size', pagination.size.toString())
      .set('sort', pagination.sort.join(','));

    return this.http.get<SearchResponse<Complaint>>(`${environment.API_URL}/complaints/search`, { params }).pipe(
      map((res) => State.Builder<SearchResponse<Complaint>>().forSuccess(res)),
      startWith(State.Builder<SearchResponse<Complaint>>().forInit()),
      catchError((err) => of(State.Builder<SearchResponse<Complaint>>().forError(err))),
    );
  }

  create(createComplaint: CreateComplaintDTO): Observable<State<Complaint>> {
    return this.http.post<Complaint>(`${environment.API_URL}/complaints/register`, createComplaint).pipe(
      map((res) => State.Builder<Complaint>().forSuccess(res)),
      startWith(State.Builder<Complaint>().forInit()),
      catchError((err) => of(State.Builder<Complaint>().forError(err))),
    );
  }

  // UpdateComplaintDTO:
  /**
   * 
   * 
   *   publicId: string;
     title?: string;
     description?: string;
     type?: ComplaintType;
     priority?: ComplaintPriority;
     status?: ComplaintStatus;
     assignedToPublicId?: string | null;
   */

  update(updateComplaint: UpdateComplaintDTO): Observable<State<Complaint>> {
    return this.http.patch<Complaint>(`${environment.API_URL}/complaints/update/${updateComplaint.publicId}`, updateComplaint).pipe(
      map((res) => State.Builder<Complaint>().forSuccess(res)),
      startWith(State.Builder<Complaint>().forInit()),
      catchError((err) => of(State.Builder<Complaint>().forError(err))),
    );
  }

  delete(ids: string[]): Observable<State<string[]>> {
    return this.http
      .delete<string[]>(`${environment.API_URL}/complaints/bulk`, { body: ids }) // ✅ passer le body ici
      .pipe(
        map((res: string[]) => State.Builder<string[]>().forSuccess(res)),
        startWith(State.Builder<string[]>().forInit()),
        catchError((err) => of(State.Builder<any>().forError(err))),
      );
  }

  approveComplaint(id: number) {
    return this.http.post(`${environment.API_URL}/complaints/${id}/approve`, {}, { responseType: 'blob' });
  }


  updateStatus(
    complaintId: string,
    status: ComplaintStatus,
    reason: string | undefined,
    validatorId: string,
  ): Observable<State<Complaint>> {
    let params = new HttpParams().set('publicId', complaintId).set('status', status).set('validatorId', validatorId);

    console.log("FROM SERVICE REASON IS: ___________________________________");
    console.log(reason);
    
    if (reason) {
      params = params.set('reason', reason); // ajouté seulement si défini
    }

    return this.http.patch<Complaint>(`${environment.API_URL}/complaints/updateByStatus`, null, { params }).pipe(
      map((res) => State.Builder<Complaint>().forSuccess(res)),
      startWith(State.Builder<Complaint>().forInit()),
      catchError((err) => of(State.Builder<Complaint>().forError(err))),
    );
  }
}
