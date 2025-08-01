import { DatePipe, CurrencyPipe, NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, Router} from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../shared/models/order';
import { AddressPipe } from '../../../shared/pipes/address.pipe';
import { PaymentCardPipe } from '../../../shared/pipes/payment-card.pipe';
import { AccountService } from '../../../core/services/account.service';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-order-detail',
  imports: [
    MatCardModule,
    MatButton,
    DatePipe,
    CurrencyPipe,
    PaymentCardPipe,
    AddressPipe,
    NgIf,
    AddressPipe
],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss'
})
export class OrderDetailComponent implements OnInit {
  private orderService = inject(OrderService);
  private activatedRoute = inject(ActivatedRoute);
  accountService = inject(AccountService);
  private adminService = inject(AdminService);
  private router = inject(Router);
  order?: Order;
  buttonText = this.accountService.isAdmin() ? 'Return to management' : 'Return to order'

  ngOnInit(): void {
    this.loadOrder();
  }

  onReturnClick() {
    this.accountService.isAdmin()
      ? this.router.navigateByUrl('/admin')
      : this.router.navigateByUrl('/orders')
  }

  loadOrder() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if(!id) return;
    const loadOrderData = this.accountService.isAdmin()
      ? this.adminService.getOrder(+id)
      : this.orderService.getOrderDetailed(+id);
    loadOrderData.subscribe({
      next: order => this.order = order
    })
  }

  markAsDelivered(id: number) {
  this.orderService.markOrderAsDelivered(id).subscribe({
    next: () => {
      this.order!.status = 'Delivered';
      this.router.navigateByUrl('/admin');
    },
    error: err => console.error('Failed to mark as delivered', err)
  });
}


}
