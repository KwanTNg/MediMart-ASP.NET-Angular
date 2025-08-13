import { Component, inject, OnInit } from '@angular/core';
import { ShopService } from '../../../core/services/shop.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../../shared/models/product';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDivider } from '@angular/material/divider';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';
import { MatDialog } from '@angular/material/dialog';
import { ProductUpdateDialogComponent } from '../product-update-dialog/product-update-dialog.component';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { IsAdminDirective } from '../../../shared/directives/is-admin.directive';
import { AccountService } from '../../../core/services/account.service';
import { ProductItemComponent } from "../product-item/product-item.component";
import { ShopParams } from '../../../shared/models/shopParams';

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
    FormsModule,
    IsAdminDirective,
    ProductItemComponent
],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss'
})
export class ProductDetailsComponent implements OnInit {
  private shopService = inject(ShopService);
  private activatedRoute = inject(ActivatedRoute);
  private cartService = inject(CartService);
  private dialogService = inject(MatDialog);
  private dialog = inject(MatDialog);
  private snack = inject(SnackbarService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  accountService = inject(AccountService);
  encodeURIComponent = encodeURIComponent;
  productUrl = '';
  product?: Product;
  quantityInCart = 0;
  quantity = 0;
  relatedProducts: Product[] = [];
  shopParams = new ShopParams();

  ngOnInit(): void {
    this.productUrl = window.location.href; // current page URL
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (!id) return;
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Load selected product
      this.shopService.getProduct(+id).subscribe(prod => {
        this.product = prod;

        if (this.shopService.lastProductList?.length) {
          this.relatedProducts = this.shopService.lastProductList
            .filter(p => p.id !== prod.id && p.category === prod.category)
            .slice(0, 5);
        }
        else {
          // Fallback: fetch all products from API
          this.shopService.getProducts(this.shopParams).subscribe(all => {
            this.relatedProducts = all.data
              .filter(p => p.id !== prod.id && p.category === prod.category)
              .slice(0, 5);
          });
        }
        this.updateQuantityInCart();
      });
    });
  

    // this.loadProduct();
    this.cartService.cartChanges?.subscribe(() => {
    this.updateQuantityInCart();
  });
  }

  // loadProduct() {
  //   const id = this.activatedRoute.snapshot.paramMap.get('id');
  //   if (!id) return;
  //   this.shopService.getProduct(+id).subscribe({
  //     next: product => {
  //       this.product = product,
  //       // Remove current product from related list
  //       this.relatedProducts = this.relatedProducts.filter(p => p.id !== product.id).slice(0, 5);
  //       this.updateQuantityInCart();
  //     },
  //     error: error => console.log(error)
  //   })
  // }

  updateCart() {
    if (!this.product) return;
    if (this.quantity > this.quantityInCart) {
      const itemsToAdd = this.quantity - this.quantityInCart;
      this.cartService.addItemToCart(this.product, itemsToAdd);
    } else {
      const itemsToRemove = this.quantityInCart - this.quantity;
      this.cartService.removeItemFromCart(this.product.id, itemsToRemove);
    }
  }

  updateQuantityInCart() {
    const cartItem = this.cartService.cart()?.items
    .find(x => x.productId === this.product?.id);
    this.quantityInCart = cartItem?.quantity || 0;
    this.quantity = this.quantityInCart || 1;
  }

  getButtonText() {
    return this.quantityInCart > 0 ? 'Update cart' : 'Add to cart'
  } 

  openProductUpdateDialog() {
    const dialogRef = this.dialogService.open(ProductUpdateDialogComponent, {
      width: '90vw',
      maxWidth: '1700px',
      maxHeight: '90vh',
      data: {
        product: this.product,
        mode: 'edit'
      }
    });
  }

removeProduct(id: number) {
  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    width: '350px',
    data: {
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this product? This action cannot be undone.'
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.shopService.deleteProduct(id).subscribe({
        next: () => {
          this.snack.success("Product Deleted!");
          this.router.navigateByUrl('/');
          },
        error: () => this.snack.error("Cannot Delete Product!"),
      });
    }
  });
}


}
