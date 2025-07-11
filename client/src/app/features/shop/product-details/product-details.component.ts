import { Component, inject, OnInit } from '@angular/core';
import { ShopService } from '../../../core/services/shop.service';
import { ActivatedRoute } from '@angular/router';
import { Product } from '../../../shared/models/product';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDivider } from '@angular/material/divider';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-product-details',
  imports: [
    MatButton,
    MatIcon,
    MatFormField,
    MatInput,
    MatDivider,
    MatLabel,
    CurrencyPipe,
    FormsModule
  ],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss'
})
export class ProductDetailsComponent implements OnInit {
  private shopService = inject(ShopService);
  private activatedRoute = inject(ActivatedRoute);
  private cartService = inject(CartService);
  product?: Product;
  quantityInCart = 0;
  quantity = 0;

  ngOnInit(): void {
    this.loadProduct();
    this.cartService.cartChanges?.subscribe(() => {
    this.updateQuantityInCart();
  });
  }

  loadProduct() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (!id) return;
    this.shopService.getProduct(+id).subscribe({
      next: product => {
        this.product = product,
        this.updateQuantityInCart();
      },
      error: error => console.log(error)
    })
  }

  updateCart() {
    if (!this.product) return;
    if (this.quantity > this.quantityInCart) {
      const itemsToAdd = this.quantity - this.quantityInCart;
      // this.quantityInCart += itemsToAdd;
      this.cartService.addItemToCart(this.product, itemsToAdd);
    } else {
      const itemsToRemove = this.quantityInCart - this.quantity;
      // this.quantityInCart -= itemsToRemove;
      this.cartService.removeItemFromCart(this.product.id, itemsToRemove);
    }
  }

  updateQuantityInCart() {
    const cartItem = this.cartService.cart()?.items
    .find(x => x.productId === this.product?.id);
    // this.quantityInCart = this.cartService.cart()?.items
    // .find(x => x.productId === this.product?.id)?.quantity || 0;
    //if item not in cart yet, set to 1

    this.quantityInCart = cartItem?.quantity || 0;
    this.quantity = this.quantityInCart || 1;
  }

  getButtonText() {
    return this.quantityInCart > 0 ? 'Update cart' : 'Add to cart'
  }  

}
