import { DatePipe, CurrencyPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatLabel } from '@angular/material/form-field';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { OrderParams } from '../../../shared/models/orderParams';
import { OrderItem } from '../../../shared/models/order';

@Component({
  selector: 'app-order-item',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatSelectModule,
    CurrencyPipe,
    MatTooltipModule,
    MatTabsModule,
    RouterLink
],
  templateUrl: './order-item.component.html',
  styleUrl: './order-item.component.scss'
})
export class OrderItemComponent implements OnInit {
  private adminService = inject(AdminService);
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
}
