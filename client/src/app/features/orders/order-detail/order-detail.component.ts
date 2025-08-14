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
import { SnackbarService } from '../../../core/services/snackbar.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

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
    AddressPipe,
    MatProgressSpinnerModule
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
  private dialogService = inject(MatDialog);
  private snack = inject(SnackbarService);
  order?: Order;
  loading = false;
  buttonText = this.accountService.isAdmin() ? 'Return to management' : 'Return to order'

  ngOnInit(): void {
    this.loadOrder();
  }

  onReturnClick() {
    this.accountService.currentUser()?.roles === "Admin" || this.accountService.currentUser()?.roles === "Director"
      ? this.router.navigateByUrl('/admin')
      : this.router.navigateByUrl('/orders')
  }

  loadOrder() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if(!id) return;
    const loadOrderData = this.accountService.currentUser()?.roles === "Admin" || this.accountService.currentUser()?.roles === "Director"
      ? this.adminService.getOrder(+id)
      : this.orderService.getOrderDetailed(+id);
    loadOrderData.subscribe({
      next: order => this.order = order
    })
  }

  markAsDispatched(id: number) {
    const dialogRef = this.dialogService.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirm Dispatch',
        message: 'Are you sure you want to dispatch this order?'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
          this.orderService.markOrderAsDispatched(id).subscribe({
            next: () => {
              this.order!.status = 'Dispatched';
              this.snack.success("Order Dispatched Successfully!");
              this.router.navigateByUrl('/admin');
            },
            error: err => {console.error('Failed to mark as Dispatched', err);
              this.snack.error("Failed to mark as Dispatched.")
            }
          });
      }
    }
  )
}

  refundOrder(id: number) {
    const dialogRef = this.dialogService.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirm Refund',
        message: 'Are you sure you want to refund this order? This action cannot be undone.'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
            this.loading = true;
            this.adminService.refundOrder(id).subscribe({
              next: () => {
                this.order!.status = 'Refunded';
                this.snack.success("Order Refunded Successfully!");
                this.loading = false;
                this.router.navigateByUrl('/admin');
              },
              error: err => {console.error('Failed to refund order', err);
              this.snack.error("Failed to Refund Order.");
              this.loading = false;
              }
            })
          }
      })
  }
}
