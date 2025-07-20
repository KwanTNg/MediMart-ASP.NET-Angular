import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { Message } from '../../shared/models/message';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MessageRService {
  hubUrlChat = environment.hubUrlChat
  hubConnection?: HubConnection;
  private messageSource = new BehaviorSubject<Message | null>(null);
  message$ = this.messageSource.asObservable();

  startConnection() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrlChat, {
        withCredentials: true
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start().then(() => {
      console.log('MessageR connection started');
    }).catch(err => console.error('SignalR connection error: ', err));

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
