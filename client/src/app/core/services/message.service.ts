import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Message } from '../../shared/models/message';
import { PaginatedResult } from '../../shared/models/paginatedResult';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private baseUrl = environment.apiUrl;
  private http = inject(HttpClient);

  getMessages(container: string, pageNumber: number, pageSize: number) {
    let params = new HttpParams();

    params = params.append('pageNumber', pageNumber);
    params = params.append('pageSize', pageSize);
    params = params.append('container', container);

    return this.http.get<PaginatedResult<Message>>(this.baseUrl + 'messages', {params, withCredentials: true})
  }

  getMessageThread(recipientId: string) {
    return this.http.get<Message[]>(this.baseUrl + 'messages/thread/' + recipientId, {withCredentials: true});
  }

  sendMessage(recipientId: string, content: string) {
    return this.http.post<Message>(this.baseUrl + 'messages', {recipientId, content}, {withCredentials:true})
  }

  deleteMessage(id: number) {
    return this.http.delete(this.baseUrl + 'messages/' + id, {withCredentials:true});
  }

  sendMessageToAdmin(content: string) {
    return this.http.post<Message>(this.baseUrl + 'messages/send-to-admin', {content}, {withCredentials:true})
  }

  getMessageThreadWithAdmin() {
    return this.http.get<Message[]>(this.baseUrl + 'messages/with-admin', {withCredentials:true});
}
}
