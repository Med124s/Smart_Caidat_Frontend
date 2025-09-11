import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';
// import { Kpis, MonthlyStat, ConfidentialityStat, UserStat } from './model/stats.model';
import { environment } from 'src/environments/environment';
import { ConfidentialityStat, Kpis, MonthlyStat, UserStat } from '../models/nft';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private base = `${environment.API_URL}/stats`;

  getKpis(): Observable<Kpis> {
    return this.http.get<Kpis>(`${this.base}/kpis`).pipe(
      catchError((err) => {
        console.error('KPI load error', err);
        return of({ citizensCount: 0, totalRequests: 0, pendingRequests: 0, archivedDocuments: 0 });
      }),
      shareReplay(1),
    );
  }

  getRequestsMonthly(): Observable<MonthlyStat[]> {
    return this.http.get<MonthlyStat[]>(`${this.base}/requests/monthly`).pipe(
      catchError((err) => { console.error(err); return of([]); }),
      shareReplay(1),
    );
  }

  getConfidentialityDistribution(): Observable<ConfidentialityStat> {
    return this.http.get<ConfidentialityStat>(`${this.base}/archives/by-confidentiality`).pipe(
      catchError((err) => { console.error(err); return of({ public: 0, interne: 0, confidentiel: 0 }); }),
      shareReplay(1),
    );
  }

  getRequestsByUser(): Observable<UserStat[]> {
    return this.http.get<UserStat[]>(`${this.base}/requests/by-user`).pipe(
      catchError((err) => { console.error(err); return of([]); }),
      shareReplay(1),
    );
  }
    /** Récupérer les réclamations par citoyen */
  getComplaintsByCitizen(): Observable<{ citizenName: string; count: number }[]> {
    return this.http.get<{ citizenName: string; count: number }[]>(`${this.base}/complaints-by-citizen`);
  }
}
