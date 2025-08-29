import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
// import * as SockJS from 'sockjs-client';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  // private stompClient: Client;

  // connect() {
  //   this.stompClient = new Client({
  //     brokerURL: 'ws://localhost:8080/ws/notifications', // URL backend
  //     webSocketFactory: () => new SockJS('http://localhost:8080/ws/notifications'),
  //     reconnectDelay: 5000,
  //   });

  //   this.stompClient.onConnect = () => {
  //     console.log('Connected to WebSocket');
  //     this.stompClient.subscribe('/topic/requests', (message) => {
  //       if (message.body) {
  //         const request = JSON.parse(message.body);
  //         alert('📩 Nouvelle demande: ' + request.type);
  //         // tu peux stocker ça dans un BehaviorSubject pour l'afficher dans une icône 🔔
  //       }
  //     });
  //   };

  //   this.stompClient.activate();
  // }

  loadPendingCount() {
    this.http
      .get<number>(`${environment.API_URL}/requests/pending/count`)
      .subscribe((count) => this._pendingCount.next(count));
  }

  private _pendingCount = new BehaviorSubject<number>(0);
  pendingCount$ = this._pendingCount.asObservable();

  setPendingCount(count: number) {
    this._pendingCount.next(count);
  }

  decrementPendingCount() {
    const current = this._pendingCount.value;
    if (current > 0) {
      this._pendingCount.next(current - 1);
    }
  }


  incrementPendingCount() {
    this._pendingCount.next(this._pendingCount.value + 1);
  }
}
