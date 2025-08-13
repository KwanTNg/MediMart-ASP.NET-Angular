import { Component, inject, Input } from '@angular/core';
import { Product } from '../../../shared/models/product';
import { MatCard, MatCardActions, MatCardContent } from '@angular/material/card';
import { CurrencyPipe, NgClass, NgIf } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { IsAdminDirective } from '../../../shared/directives/is-admin.directive';
import { AccountService } from '../../../core/services/account.service';

@Component({
  selector: 'app-product-item',
  imports: [
    MatCard,
    MatCardContent,
    CurrencyPipe,
    MatCardActions,
    MatIcon,
    MatButton,
    IsAdminDirective,
    NgClass
  ],
  templateUrl: './product-item.component.html',
  styleUrl: './product-item.component.scss'
})
export class ProductItemComponent {
  @Input() product?: Product
  @Input() allProducts?: Product[];
  cartService = inject(CartService);
  accountService = inject(AccountService);
  private router = inject(Router);

goToProduct(product: Product) {
    // Scroll instantly before navigation for immediate feedback
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    this.router.navigate(['product/', product.id]).then(() => {
      // Ensure smooth scroll finishes after view updates
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 0);
    });;
  }
}
