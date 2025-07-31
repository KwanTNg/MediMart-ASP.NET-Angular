import { Component, inject, OnInit } from '@angular/core';
import { ShopService } from '../../../core/services/shop.service';
import { ShopParams } from '../../../shared/models/shopParams';
import { RouterLink } from '@angular/router';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { Pagination } from '../../../shared/models/pagination';
import { Product } from '../../../shared/models/product';
import { CurrencyPipe } from '@angular/common';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-inventory-management',
  imports: [RouterLink, MatPaginator, CurrencyPipe, MatButton],
  providers: [CurrencyPipe],
  templateUrl: './inventory-management.component.html',
  styleUrl: './inventory-management.component.scss'
})
export class InventoryManagementComponent implements OnInit {
private shopService = inject(ShopService);
private snack = inject(SnackbarService);
private currencyPipe = inject(CurrencyPipe);
shopParams = new ShopParams();
products?: Pagination<Product>;

  ngOnInit(): void {
    this.shopParams.sort = "quantityAsc";
    this.loadProducts();
  }

  loadProducts() {
     this.shopService.getProducts(this.shopParams).subscribe({
      next: response => this.products = response,
      error: error => this.snack.error("Too Many Requests!"),
  })
  }

  onPageChange(event: PageEvent) {
    this.shopParams.pageNumber = event.pageIndex + 1;
    this.shopParams.pageSize = event.pageSize;
    this.loadProducts();
}

downloadCSV(): void {
    if (!this.products?.data.length) {
      alert('No orders to export');
      return;
    }

    // Prepare CSV headers
    const headers = ['ID', 'Name', 'Price', 'Quantity In Stock', 'Category'];

    // Prepare CSV rows
    const rows = this.products?.data.map(product => [
      product.id,
      product.name,
      this.currencyPipe.transform(product.price, 'GBP', 'symbol'),
      product.quantityInStock,
      product.category
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','), // CSV header row
      ...rows.map(e => e.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')) // Escape quotes & join columns
    ].join('\n');

    // Create blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  }
}
