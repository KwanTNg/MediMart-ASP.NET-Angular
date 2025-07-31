import { CurrencyPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { OrderParams } from '../../../shared/models/orderParams';
import { OrderItem } from '../../../shared/models/order';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-order-item',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatSelectModule,
    CurrencyPipe,
    MatTooltipModule,
    MatTabsModule,
    RouterLink,
    MatButton
],
providers: [CurrencyPipe],
  templateUrl: './order-item.component.html',
  styleUrl: './order-item.component.scss'
})
export class OrderItemComponent implements OnInit {
  private adminService = inject(AdminService);
  private currencyPipe = inject(CurrencyPipe);
  orderParams = new OrderParams();
  orderItems: OrderItem[] = []
  totalItems = 0;
  
  ngOnInit(): void {
    this.loadOrderItems();
  }
  
  loadOrderItems() {
    this.adminService.getOrderItems(this.orderParams).subscribe({
      next: orderItems => {this.orderItems = orderItems.data;
        console.log(orderItems);
            this.totalItems = orderItems.count;
      }
    })
  }

  onPageChange(event: PageEvent) {
    this.orderParams.pageNumber = event.pageIndex + 1;
    this.orderParams.pageSize = event.pageSize;
    this.loadOrderItems();
  }

  onFilterSelect(event: MatSelectChange) {
    this.orderParams.filter = event.value;
    this.orderParams.pageNumber = 1;
    this.loadOrderItems();
    }

  downloadCSV(): void {
    if (!this.orderItems.length) {
      alert('No orders to export');
      return;
    }

    // Prepare CSV headers
    const headers = ['Order', 'Product ID', 'Product Name', 'Price', 'Quantity'];

    // Prepare CSV rows
    const rows = this.orderItems.map(orderItem => [
      orderItem.id,
      orderItem.productId,
      orderItem.productName,
      this.currencyPipe.transform(orderItem.price, 'GBP', 'symbol'),
      orderItem.quantity
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
