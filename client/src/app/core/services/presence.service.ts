import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { SnackbarService } from './snackbar.service';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { User } from '../../shared/models/users';

@Injectable({
  providedIn: 'root'
})
export class PresenceService {
  private hubUrl = environment.hubUrlChat;
  private snack = inject(SnackbarService);
  public hubConnection?: HubConnection;
  onlineUsers : WritableSignal<string[]> = signal([])
  
  createHubConnection() {
    this.hubConnection = new HubConnectionBuilder()
    .withUrl(this.hubUrl + 'presence', {
      withCredentials: true
    })
      .withAutomaticReconnect()
      .build();
    this.hubConnection.start()
      .catch(error => console.log(error));

    this.hubConnection.on('UserOnline', userId => {
      this.onlineUsers.update(users => [...users, userId]);
    })
    this.hubConnection.on('UserOffline', userId => {
      this.onlineUsers.update(users => users.filter(x => x !== userId))
    })
    this.hubConnection.on('GetOnlineUsers', userIds => {
      this.onlineUsers.set(userIds);
    })
  }

  stopHubConnection() {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      this.hubConnection.stop().catch(error => console.log(error))
    }
  }
}
