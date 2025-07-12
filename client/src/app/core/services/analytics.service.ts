import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http'
import { SalesOverTime } from '../../shared/models/salesOverTime';
import { map, Observable } from 'rxjs';
import { TopSellingProduct } from '../../shared/models/topSellingProduct';
import { SalesByStatus } from '../../shared/models/salesByStatus';
import { RevenuePerProduct } from '../../shared/models/RevenuePerProduct';

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

getTopSellingProducts(): Observable<TopSellingProduct[]> {
  return this.http.get<TopSellingProduct[]>(
    this.baseUrl + 'analytics/top-selling-products',
    { withCredentials: true }
  );
}

getSalesByStatus(): Observable<SalesByStatus[]> {
  return this.http.get<SalesByStatus[]>(
    this.baseUrl + 'analytics/sales-by-status',
    { withCredentials: true }
  );
}

getRevenuePerProduct(): Observable<RevenuePerProduct[]> {
  return this.http.get<RevenuePerProduct[]>(this.baseUrl + 'analytics/revenue-per-product', {
    withCredentials: true
  });
}



}
