import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  baseUrl = environment.apiUrl;
  private http = inject(HttpClient);

  askGemini(message: string) {
    return this.http.post<any>(this.baseUrl + 'chatbot', { message });
  }
}
