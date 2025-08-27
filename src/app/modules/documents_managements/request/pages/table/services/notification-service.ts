import { Injectable } from '@angular/core';
import { Client } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private stompClient: Client;

  connect() {
    this.stompClient = new Client({
      brokerURL: 'ws://localhost:8080/ws/notifications', // URL backend
      webSocketFactory: () => new SockJS('http://localhost:8080/ws/notifications'),
      reconnectDelay: 5000,
    });

    this.stompClient.onConnect = () => {
      console.log('Connected to WebSocket');
      this.stompClient.subscribe('/topic/requests', (message) => {
        if (message.body) {
          const request = JSON.parse(message.body);
          alert('📩 Nouvelle demande: ' + request.type);
          // tu peux stocker ça dans un BehaviorSubject pour l'afficher dans une icône 🔔
        }
      });
    };

    this.stompClient.activate();
  }
}
