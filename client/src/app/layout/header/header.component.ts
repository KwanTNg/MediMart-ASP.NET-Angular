import { Component, inject, ViewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatBadge } from '@angular/material/badge';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatProgressBar } from '@angular/material/progress-bar'
import { CartService } from '../../core/services/cart.service';
import { MatMenu, MatMenuItem, MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { AccountService } from '../../core/services/account.service';
import { MatDivider } from "@angular/material/divider";
import { IsAdminDirective } from '../../shared/directives/is-admin.directive';


@Component({
  selector: 'app-header',
  imports: [
    MatIcon,
    MatButton,
    MatBadge,
    RouterLink,
    RouterLinkActive,
    MatProgressBar,
    MatMenuModule,
    MatDivider,
    MatMenu,
    MatMenuItem,
    IsAdminDirective
],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  cartService = inject(CartService);
  @ViewChild(MatMenuTrigger) trigger!: MatMenuTrigger;
  loading = false;

  accountService = inject(AccountService);
  private router = inject(Router);

  logout() {
    this.accountService.logout().subscribe({
      next: () => {
        this.accountService.currentUser.set(null);
        this.router.navigateByUrl('/');
      }
    })
  }

}
