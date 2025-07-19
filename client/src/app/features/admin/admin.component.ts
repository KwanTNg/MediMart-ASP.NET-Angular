import { Component, inject, OnInit } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { OrderManagementComponent } from "./order-management/order-management.component";
import { OrderItemComponent } from "./order-item/order-item.component";
import { UserManagementComponent } from "./user-management/user-management.component";
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-admin',
  imports: [
    MatTabsModule,
    OrderManagementComponent,
    OrderItemComponent,
    UserManagementComponent
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
        default:
          this.selectedTabIndex = 0;
      }
    });
  }

}
