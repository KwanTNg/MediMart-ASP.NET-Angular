import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Message } from '../../shared/models/message';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MessageRService {
  private hubConnection?: signalR.HubConnection;
  private messageSource = new BehaviorSubject<Message | null>(null);
  message$ = this.messageSource.asObservable();

  startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.hubUrlChat}message`, {
        withCredentials: true
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .catch(err => console.error('SignalR connection error: ', err));

    this.hubConnection.on('NewMessage', (message: Message) => {
      this.messageSource.next(message);
    });

    this.hubConnection.onclose(error => {
  console.warn('SignalR disconnected', error);
});

this.hubConnection.onreconnecting(error => {
  console.warn('SignalR reconnecting', error);
});

this.hubConnection.onreconnected(connectionId => {
  console.log('SignalR reconnected', connectionId);
});
  }

  stopConnection() {
    this.hubConnection?.stop();
  }
}
