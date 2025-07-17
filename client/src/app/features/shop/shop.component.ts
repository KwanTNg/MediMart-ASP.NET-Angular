import { Component, inject, OnInit } from '@angular/core';
import { ShopService } from '../../core/services/shop.service';
import { Product } from '../../shared/models/product';
import { ProductItemComponent } from "./product-item/product-item.component";
import { MatDialog } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { FiltersDialogComponent } from './filters-dialog/filters-dialog.component';
import { MatIcon } from '@angular/material/icon';
import { SymptomsFilterDialogComponent } from './symptoms-filter-dialog/symptoms-filter-dialog.component';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatListOption, MatSelectionList, MatSelectionListChange } from '@angular/material/list';
import { ShopParams } from '../../shared/models/shopParams';
import { MatPaginator, PageEvent } from '@angular/material/paginator'
import { Pagination } from '../../shared/models/pagination';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../core/services/account.service';
import { SnackbarService } from '../../core/services/snackbar.service';

@Component({
  selector: 'app-shop',
  imports: [
    ProductItemComponent,
    MatButton,
    MatIcon,
    MatMenu,
    MatSelectionList,
    MatListOption,
    MatMenuTrigger,
    MatPaginator,
    FormsModule
],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss'
})
export class ShopComponent implements OnInit {
  private shopService = inject(ShopService);
  private accountService = inject(AccountService);
  private dialogService = inject(MatDialog);
  private snack = inject(SnackbarService);
  products?: Pagination<Product>;

  sortOptions = [
    {name: 'Alphabetical', value: 'name'},
    {name: 'Price: Low-High', value: 'priceAsc'},
    {name: 'Price: High-Low', value: 'priceDesc'}
  ]
  shopParams = new ShopParams();
  pageSizeOptions = [6,12,18,24]

   ngOnInit(): void {
    this.initializeShop();
  }

initializeShop() {
  this.shopService.getBrands();
  this.shopService.getTypes();
  this.shopService.getCategories();
  this.shopService.getSymptoms();
  this.accountService.getUserInfo();
  this.getProducts();
  }

getProducts() {
  this.shopService.getProducts(this.shopParams).subscribe({
      next: response => this.products = response,
      error: error => this.snack.error("Too Many Requests!"),
  })
}

openFilterDialog() {
  const dialogRef = this.dialogService.open(FiltersDialogComponent, {
    width: '90vw',
    maxWidth: '850px',
    maxHeight: '90vh',
    height: 'auto',
    data: {
      selectedBrands: this.shopParams.brands,
      selectedTypes: this.shopParams.types,
      selectedCategories: this.shopParams.categories
    }
  });
  dialogRef.afterClosed().subscribe({
    next: result => {
      if (result) {
        this.shopParams.brands = result.selectedBrands;
        this.shopParams.types = result.selectedTypes;
        this.shopParams.categories = result.selectedCategories;
        this.shopParams.pageNumber = 1;
        this.getProducts();
      }
    }
  })
}

openSymptomFilterDialog() {
  const dialogRef = this.dialogService.open(SymptomsFilterDialogComponent, {
    width: '500px',
    disableClose: true
  });

  dialogRef.afterClosed().subscribe({
    next: (selectedSymptomIds: number[]) => {
      if (selectedSymptomIds?.length) {
        this.shopParams.symptomIds = selectedSymptomIds;
        this.shopParams.pageNumber = 1;
        this.getProducts();
      }
    }
  });
}

onSortChange(event: MatSelectionListChange) {
  const selectedOption = event.options[0];
  if (selectedOption) {
    this.shopParams.sort = selectedOption.value;
    this.shopParams.pageNumber = 1;
    this.getProducts();
  }
}

handlePageEvent(event: PageEvent) {
  this.shopParams.pageNumber = event.pageIndex + 1;
  this.shopParams.pageSize = event.pageSize;
  this.getProducts();
}

onSearchChange() {
  this.shopParams.pageNumber = 1;
  this.getProducts();
}

}
