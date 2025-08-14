import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { OrderParams } from '../../shared/models/orderParams';
import { Pagination } from '../../shared/models/pagination';
import { Order, OrderItem } from '../../shared/models/order';
import { ChangeUserRoleDto } from '../../shared/models/changeUserRoleDto';
import { ContactRequest } from '../../shared/models/contactRequest';
import { ContactMessageParams } from '../../shared/models/contactMessageParams';
import { ContactMessage } from '../../shared/models/contactMessage';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  baseUrl = environment.apiUrl;
  private http = inject(HttpClient);

  getOrders(orderParams: OrderParams) {
    let params = new HttpParams();
    if (orderParams.filter && orderParams.filter !== 'All') {
      params = params.append('status', orderParams.filter);
    }
    params = params.append('pageIndex', orderParams.pageNumber);
    params = params.append('pageSize', orderParams.pageSize);
    return this.http.get<Pagination<Order>>(this.baseUrl + 'admin/orders', {params, withCredentials: true});
  }

  getOrder(id: number) {
    return this.http.get<Order>(this.baseUrl + 'admin/orders/' + id, {withCredentials: true});
  }

  getOrderItems(orderParams: OrderParams) {
    let params = new HttpParams();
    if (orderParams.filter && orderParams.filter !== 'All') {
      params = params.append('status', orderParams.filter);
    }
    params = params.append('pageIndex', orderParams.pageNumber);
    params = params.append('pageSize', orderParams.pageSize);
    return this.http.get<Pagination<OrderItem>>(this.baseUrl + 'admin/order-items', {params, withCredentials: true});
  }

  getOrdersForUser(email: string) {
    return this.http.get<Order[]>(this.baseUrl + 'admin/orders/' + email, {withCredentials: true});
  }

  changeUserRole(dto: ChangeUserRoleDto) {
    return this.http.post(this.baseUrl + 'account/change-role', dto, {withCredentials: true});
  }

  getContactMessages(contactMessageParams: ContactMessageParams) {
    let params = new HttpParams();
    params = params.append('pageIndex', contactMessageParams.pageNumber);
    params = params.append('pageSize', contactMessageParams.pageSize);
    return this.http.get<Pagination<ContactMessage>>(this.baseUrl + 'admin/contact-messages/', {params, withCredentials: true});
  }

  sendContactMessage(formData: FormData) {
    return this.http.post(this.baseUrl + 'contact/send', formData);
  }

  refundOrder(id: number) {
    return this.http.post(this.baseUrl + 'admin/orders/refund/' + id, {}, {withCredentials: true});
  }
}
