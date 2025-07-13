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
    RouterLink
],
  templateUrl: './order-management.component.html',
  styleUrl: './order-management.component.scss'
})
export class OrderManagementComponent implements OnInit {
  private adminService = inject(AdminService);
  orderParams = new OrderParams();
  orders: Order[] = []
  totalItems = 0;
  statusOptions = ['All', 'PaymentReceived', 'PaymentMismatch', 'StockIssue', 'Pending']
  
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

}
