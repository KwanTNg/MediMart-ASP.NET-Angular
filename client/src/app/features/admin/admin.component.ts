import { Component, inject, OnInit } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { OrderManagementComponent } from "./order-management/order-management.component";
import { OrderItemComponent } from "./order-item/order-item.component";
import { UserManagementComponent } from "./user-management/user-management.component";
import { ActivatedRoute } from '@angular/router';
import { InventoryManagementComponent } from './inventory-management/inventory-management.component';
import { IsAdminDirective } from '../../shared/directives/is-admin.directive';

@Component({
  selector: 'app-admin',
  imports: [
    MatTabsModule,
    OrderManagementComponent,
    OrderItemComponent,
    InventoryManagementComponent,
    UserManagementComponent,
    IsAdminDirective
],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  private route = inject(ActivatedRoute);
  selectedTabIndex = 0;

  ngOnInit(): void {
    this.route.fragment.subscribe(fragment => {
      switch (fragment) {
        case'order-summary':
          this.selectedTabIndex = 0;
          break;
        case 'order-items':
          this.selectedTabIndex = 1;
          break;
        case 'user-management':
          this.selectedTabIndex = 2;
          break;
        case 'inventory-management':
          this.selectedTabIndex = 3;
          break;
        default:
          this.selectedTabIndex = 0;
      }
    });
  }

}
