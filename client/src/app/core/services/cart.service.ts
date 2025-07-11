import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Cart, CartItem } from '../../shared/models/cart';
import { Product } from '../../shared/models/product';
import { firstValueFrom, map } from 'rxjs';
import { SnackbarService } from './snackbar.service';
import { AccountService } from './account.service';
import { DeliveryMethod } from '../../shared/models/deliveryMethod';
import { ShopService } from './shop.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  private accountService = inject(AccountService);
  private shopService = inject(ShopService);
  private snackbar = inject(SnackbarService);
  cart = signal<Cart | null>(null);

  itemCount = computed(() => {
    return this.cart()?.items.reduce((sum, item) => sum + item.quantity, 0)
  });

  selectedDelivery = signal<DeliveryMethod | null>(null);

  totals = computed(() => {
    const cart = this.cart();
    const delivery = this.selectedDelivery();
    if (!cart) return null;
    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const shipping = delivery ? delivery.price : 0;
    const discount = 0;
    return {
      subtotal,
      shipping,
      discount,
      total: subtotal + shipping - discount 
    }   
  })

  private cartSubject = new BehaviorSubject<Cart | null>(null);
  cartChanges = this.cartSubject.asObservable();

  getCart(id: string) {
    return this.http.get<Cart>(this.baseUrl + 'cart?id=' + id).pipe(
        map(cart => {
         this.cart.set(cart);
         return cart;
      })
    )
  }

  setCart(cart: Cart) {
    return this.http.post<Cart>(this.baseUrl + 'cart', cart).subscribe({
          next: updatedCart => {this.cartSubject.next(updatedCart);
            this.cart?.set(updatedCart);
          },
          error: error => console.error('Error updating cart:', error)
    })
  }

  // async addItemToCart(item: CartItem | Product, quantity = 1) {
  //   const cart = this.cart() ?? this.createCart()
  //   // Check for prescription restriction
  //   if (this.accountService.currentUser()?.roles !== "Pharmacist" && item.category === "Prescription") {
  //     this.snackbar.error("Please ask for prescription!");
  //     return;
  //   }
  //   // If it's a Product, check stock before adding
  //   if (this.isProduct(item)) {
  //     try {
  //       //firstValueFrom turns the Observable into a Promise
  //       const product = await firstValueFrom(this.shopService.getProduct(item.id));
  //       const productId = item.id;
  //       const existingItem = cart.items.find(i => i.productId === productId);
  //       const currentQuantityInCart = existingItem?.quantity ?? 0;
      
  //     if (product.quantityInStock === 0) {
  //       this.snackbar.error("This product is out of stock.");
  //       return;
  //     }

  //     if (product.quantityInStock < currentQuantityInCart + quantity) {
  //       this.snackbar.error(`Only ${product.quantityInStock} item(s) in stock.`);
  //       return;
  //     }      
  //     item = this.mapProductToCartItem(item);
  //   } catch (error) {
  //     this.snackbar.error("Failed to check product stock.");
  //     return;
  //   }
  // }
  //   cart.items = this.addOrUpdateItem(cart.items, item, quantity);
  //   this.setCart(cart);
  // }

async addItemToCart(item: CartItem | Product, quantity = 1) {
  const cart = this.cart() ?? this.createCart();

  const category = this.isProduct(item) ? item.category : item.category;
  if (
    this.accountService.currentUser()?.roles !== "Pharmacist" &&
    category === "Prescription"
  ) {
    this.snackbar.error("Please ask for prescription!");
    return;
  }

  const productId = this.isProduct(item) ? item.id : item.productId;

  try {
    const product = await firstValueFrom(this.shopService.getProduct(productId));
    const existingItem = cart.items.find(i => i.productId === productId);
    const currentQuantityInCart = existingItem?.quantity ?? 0;

    if (product.quantityInStock === 0) {
      this.snackbar.error("This product is out of stock.");
      return;
    }

    if (product.quantityInStock < currentQuantityInCart + quantity) {
      this.snackbar.error(`Only ${product.quantityInStock} item(s) in stock.`);
      return;
    }

    if (this.isProduct(item)) {
      item = this.mapProductToCartItem(item);
    }
  } catch (error) {
    this.snackbar.error("Failed to check product stock.");
    return;
  }

  cart.items = this.addOrUpdateItem(cart.items, item, quantity);
  this.setCart(cart);
}


  removeItemFromCart(productId: number, quantity = 1) {
    const cart = this.cart();
    if (!cart) return;
    const index = cart.items.findIndex(x => x.productId === productId);
    //-1 means item not in cart
    if (index !== -1) {
      if (cart.items[index].quantity > quantity) {
        cart.items[index].quantity -= quantity;
      } else {
        //remove the item
        cart.items.splice(index, 1);
      }
      if (cart.items.length === 0) {
        //remove the cart
        this.deleteCart();
      } else {
        //update the cart
        this.setCart(cart);
      }
    }
  }
  
  deleteCart() {
    this.http.delete(this.baseUrl + 'cart?id=' + this.cart()?.id).subscribe({
      next: () => {
        localStorage.removeItem('cart_id');
        this.cart.set(null);
      }
    })
  }

  private addOrUpdateItem(items: CartItem[], item: CartItem, quantity: number): CartItem[] {
    const index = items.findIndex(x => x.productId === item.productId);
    if (index === -1) {
      item.quantity = quantity;
      items.push(item);
    } else {
      items[index].quantity += quantity
    }
    return items;
  }

  private mapProductToCartItem(item: Product): CartItem {
    return {
      productId: item.id,
      productName: item.name,
      price: item.price,
      quantity: 0,
      pictureUrl: item.pictureUrl,
      brand: item.brand,
      type: item.type,
      category: item.category
    }
  }

  private isProduct(item: CartItem | Product): item is Product {
    return (item as Product).id !== undefined;
  }


  private createCart(): Cart {
    const cart = new Cart();
    localStorage.setItem('cart_id', cart.id);
    return cart;
  }

  
}

