import { Injectable, signal } from '@angular/core'
import { environment } from '../../../environments/environment'
import { HubConnection, HubConnectionBuilder, HubConnectionState} from '@microsoft/signalr';
import { Order } from '../../shared/models/order';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  hubUrl= environment.hubUrl;
  hubConnection?: HubConnection;
  orderSignal = signal<Order | null>(null);

  createHubConnection() {
    this.hubConnection = new HubConnectionBuilder()
    .withUrl(this.hubUrl, {
      //our cookies will be sent up when we make connection to this hub
      withCredentials: true
    })
    .withAutomaticReconnect()
    .build();
  
    this.hubConnection.start().then(() => {
    console.log('SignalR connection started');
    }).
    catch(error => console.log(error))

    this.hubConnection.on('OrderCompleteNotification', (order: Order) => {
      //once we get the order from backend, we set it here
      this.orderSignal.set(order)
    })
  }

  stopHubConnection() {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      this.hubConnection.stop().catch(error => console.log(error))
    }
  }


}
