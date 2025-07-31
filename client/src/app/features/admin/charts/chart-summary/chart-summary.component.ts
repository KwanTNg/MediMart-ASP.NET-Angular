import { Component } from '@angular/core';
import { SalesChartComponent } from "../sales-chart/sales-chart.component";
import { TopSellingProductsComponent } from "../top-selling-products/top-selling-products.component";
import { SalesByStatusComponent } from "../sales-by-status/sales-by-status.component";
import { RevenuePerProductComponent } from "../revenue-per-product/revenue-per-product.component";
import { RouterLink } from '@angular/router';
import { AverageDeliveryTimeComponent } from "../average-delivery-time/average-delivery-time.component";
import { DeliveryDistributionComponent } from "../delivery-distribution/delivery-distribution.component";
import { OnTimeDispatchRateComponent } from "../on-time-dispatch-rate/on-time-dispatch-rate.component";
import { RoleDistributionComponent } from "../role-distribution/role-distribution.component";
import { RegistrationsOverTimeComponent } from "../registrations-over-time/registrations-over-time.component";

@Component({
  selector: 'app-chart-summary',
  imports: [SalesChartComponent, TopSellingProductsComponent, SalesByStatusComponent, RevenuePerProductComponent, RouterLink, AverageDeliveryTimeComponent, DeliveryDistributionComponent, OnTimeDispatchRateComponent, RoleDistributionComponent, RegistrationsOverTimeComponent],
  templateUrl: './chart-summary.component.html',
  styleUrl: './chart-summary.component.scss'
})
export class ChartSummaryComponent {

}
