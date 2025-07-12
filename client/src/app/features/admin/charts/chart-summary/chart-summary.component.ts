import { Component } from '@angular/core';
import { SalesChartComponent } from "../sales-chart/sales-chart.component";
import { TopSellingProductsComponent } from "../top-selling-products/top-selling-products.component";
import { SalesByStatusComponent } from "../sales-by-status/sales-by-status.component";
import { RevenuePerProductComponent } from "../revenue-per-product/revenue-per-product.component";

@Component({
  selector: 'app-chart-summary',
  imports: [SalesChartComponent, TopSellingProductsComponent, SalesByStatusComponent, RevenuePerProductComponent],
  templateUrl: './chart-summary.component.html',
  styleUrl: './chart-summary.component.scss'
})
export class ChartSummaryComponent {

}
