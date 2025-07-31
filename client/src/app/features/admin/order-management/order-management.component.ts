import { Component, inject, OnInit } from '@angular/core';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { Order } from '../../../shared/models/order';
import { AdminService } from '../../../core/services/admin.service';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { OrderParams } from '../../../shared/models/orderParams';
import { MatLabel, MatSelectChange, MatSelectModule } from '@angular/material/select';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-order-management',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatSelectModule,
    DatePipe,
    CurrencyPipe,
    MatLabel,
    MatTooltipModule,
    MatTabsModule,
    RouterLink,
    MatButton
],
providers: [DatePipe, CurrencyPipe],
  templateUrl: './order-management.component.html',
  styleUrl: './order-management.component.scss'
})
export class OrderManagementComponent implements OnInit {
  private adminService = inject(AdminService);
  private datePipe = inject(DatePipe);
  private currencyPipe = inject(CurrencyPipe);
  orderParams = new OrderParams();
  orders: Order[] = []
  totalItems = 0;
  statusOptions = ['All', 'PaymentReceived', 'PaymentMismatch', 'StockIssue', 'Pending', 'Delivered']
  
  ngOnInit(): void {
    this.loadOrders();
  }
  
  loadOrders() {
    this.adminService.getOrders(this.orderParams).subscribe({
      next: orders => {this.orders = orders.data;
            this.totalItems = orders.count;
      }
    })
  }

  onPageChange(event: PageEvent) {
    this.orderParams.pageNumber = event.pageIndex + 1;
    this.orderParams.pageSize = event.pageSize;
    this.loadOrders();
  }

  onFilterSelect(event: MatSelectChange) {
    this.orderParams.filter = event.value;
    this.orderParams.pageNumber = 1;
    this.loadOrders();
    }
  
  downloadCSV(): void {
    if (!this.orders.length) {
      alert('No orders to export');
      return;
    }

    // Prepare CSV headers
    const headers = ['Order', 'Buyer Email', 'Date', 'Status', 'Total'];

    // Prepare CSV rows
    const rows = this.orders.map(order => [
      order.id,
      order.buyerEmail,
      this.datePipe.transform(order.orderDate, 'medium'),
      order.status,
      this.currencyPipe.transform(order.total, 'GBP', 'symbol')
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','), // CSV header row
      ...rows.map(e => e.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')) // Escape quotes & join columns
    ].join('\n');

    // Create blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  }
}


