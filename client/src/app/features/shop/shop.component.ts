import { Component, inject, OnInit } from '@angular/core';
import { ShopService } from '../../core/services/shop.service';
import { Product } from '../../shared/models/product';
import { ProductItemComponent } from "./product-item/product-item.component";
import { MatDialog } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { FiltersDialogComponent } from './filters-dialog/filters-dialog.component';
import { MatIcon } from '@angular/material/icon';
import { SymptomsFilterDialogComponent } from './symptoms-filter-dialog/symptoms-filter-dialog.component';

@Component({
  selector: 'app-shop',
  imports: [
    ProductItemComponent,
    MatButton,
    MatIcon
],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss'
})
export class ShopComponent implements OnInit {
  private shopService = inject(ShopService);
  private dialogService = inject(MatDialog);
  products: Product[] = [];
  selectedBrands: string[] = [];
  selectedTypes: string[] = [];
  selectedCategories: string[] = [];
  selectedSymptomIds: number[] = [];

   ngOnInit(): void {
    this.initializeShop();
  }

initializeShop() {
  this.shopService.getBrands();
  this.shopService.getTypes();
  this.shopService.getCategories();
  this.shopService.getSymptoms();
  this.shopService.getProducts().subscribe({
      next: response => this.products = response.data,
      error: error => console.log(error),
  })
  }

openFilterDialog() {
  const dialogRef = this.dialogService.open(FiltersDialogComponent, {
    minWidth: '700px',
    maxHeight: '90vh',
    height: 'auto',
    data: {
      selectedBrands: this.selectedBrands,
      selectedTypes: this.selectedTypes,
      selectedCategories: this.selectedCategories
    }
  });
  dialogRef.afterClosed().subscribe({
    next: result => {
      if (result) {
        this.selectedBrands = result.selectedBrands;
        this.selectedTypes = result.selectedTypes;
        this.selectedCategories = result.selectedCategories;

        this.shopService.getProducts(this.selectedBrands, this.selectedTypes, this.selectedCategories).subscribe({
          next: response => this.products = response.data,
          error: error => console.log(error)
        })
      }
    }
  })
}

// openSymptomFilterDialog(){
//   const dialogRef = this.dialogService.open(SymptomsFilterDialogComponent, {
//     minWidth: '600px',
//     data: {
//       selectedSymptoms: this.selectedSymptoms
//     }
//   });

//   dialogRef.afterClosed().subscribe({
//     next: result => {
//       if (result) {
//         this.selectedSymptoms = result.selectedSymptoms;

//         this.shopService.getProducts(this.selectedBrands, this.selectedTypes, this.selectedCategories, this.selectedSymptoms)
//           .subscribe({
//             next: response => this.products = response.data,
//             error: error => console.log(error)
//           });
//       }
//     }
//   });

// }

openSymptomFilterDialog() {
  const dialogRef = this.dialogService.open(SymptomsFilterDialogComponent, {
    width: '500px',
    disableClose: true
  });

  dialogRef.afterClosed().subscribe({
    next: (selectedSymptomIds: number[]) => {
      if (selectedSymptomIds?.length) {
        this.selectedSymptomIds = selectedSymptomIds;

        this.shopService.getProducts(
          this.selectedBrands,
          this.selectedTypes,
          this.selectedCategories,
          selectedSymptomIds
        ).subscribe({
          next: response => this.products = response.data
        });
      }
    }
  });
}


}
