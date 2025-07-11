import { Component, inject, input } from '@angular/core';
import { CartItem } from '../../../shared/models/cart';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { CurrencyPipe } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-cart-item',
  imports: [
    RouterLink,
    MatButton,
    CurrencyPipe,
    MatIcon
],
  templateUrl: './cart-item.component.html',
  styleUrl: './cart-item.component.scss'
})
export class CartItemComponent {
  item = input.required<CartItem>();
  cartService = inject(CartService);

  async incrementQuantity() {
    await this.cartService.addItemToCart(this.item());
  }

  decrementQuantity() {
    this.cartService.removeItemFromCart(this.item().productId);
  }

  removeItemFromCart() {
    this.cartService.removeItemFromCart(this.item().productId, this.item().quantity);
  }  
}
