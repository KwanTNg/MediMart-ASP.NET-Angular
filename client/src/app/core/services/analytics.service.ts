import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http'
import { SalesOverTime } from '../../shared/models/salesOverTime';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  baseUrl = environment.apiUrl;
  private http = inject(HttpClient);

getSalesOverTime(): Observable<SalesOverTime[]> {
  return this.http.get<SalesOverTime[]>(this.baseUrl + 'analytics/sales-over-time', { withCredentials: true })
    .pipe(
      map(data => data.map(item => ({
        ...item,
        date: new Date(item.date)
      })))
    );
}

}
