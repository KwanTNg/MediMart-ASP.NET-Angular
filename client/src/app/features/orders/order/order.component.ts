import { DatePipe, CurrencyPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../shared/models/order';
import { AdminService } from '../../../core/services/admin.service';
import { MatButton } from '@angular/material/button';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { ChangeUserRoleDialogComponent } from '../../admin/change-user-role-dialog/change-user-role-dialog.component';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-order',
  imports: [
    RouterLink,
    DatePipe,
    CurrencyPipe,
    MatButton
  ],
  templateUrl: './order.component.html',
  styleUrl: './order.component.scss'
})
export class OrderComponent implements OnInit {
  private orderService = inject(OrderService);
  private adminService = inject(AdminService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snack = inject(SnackbarService);
  private dialogService = inject(MatDialog);
  orders: Order[] = []
  userEmail? : string;
  userId? : string;

  ngOnInit(): void {
    const email = this.route.snapshot.paramMap.get('email');
    const userId = this.route.snapshot.paramMap.get('id');
    
    if (userId) {
      this.userId = userId;
    }

    if (email) {
      this.userEmail = email;
      this.adminService.getOrdersForUser(email).subscribe({
        next: orders => this.orders = orders
      })
    } else {
    this.orderService.getOrdersForUser().subscribe({
      next: orders => this.orders = orders
    })
  }
  }

  goBackToUserManagement() {
    this.router.navigate(['admin'], { fragment: 'user-management'});
  }

  goToMessages(userId: string) {
  this.router.navigate(['/member-messages', userId]); // e.g., /admin/messages/:id
  }

  changeUserRole() {
    if (!this.userEmail) return;

    const dialogRef = this.dialogService.open(ChangeUserRoleDialogComponent, {
      width: '400px',
      data: { email: this.userEmail}
    });
    dialogRef.afterClosed().subscribe({
      next: result => {
        if (result) {
          this.adminService.changeUserRole(result).subscribe({
            next: () => this.snack.success("User role updated successfully!"),
            error: () => this.snack.error("Failed to change user role!")
          })
        }
      }
    })
  }
}
