import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Order, OrderToCreate } from '../../shared/models/order';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  orderComplete = false;

  createOrder(orderToCreate: OrderToCreate) {
    return this.http.post<Order>(this.baseUrl + 'orders', orderToCreate, {withCredentials: true});
  }

  getOrdersForUser() {
    return this.http.get<Order[]>(this.baseUrl + 'orders', {withCredentials: true});
  }

  getOrderDetailed(id: number) {
    return this.http.get<Order>(this.baseUrl + 'orders/' + id, {withCredentials: true});
  }

  markOrderAsDelivered(id: number) {
  return this.http.put(this.baseUrl + 'admin/orders/' + id + '/deliver', {}, { withCredentials: true });
}


  
}
