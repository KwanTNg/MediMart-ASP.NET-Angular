import { Component, inject, OnInit } from '@angular/core';
import { ChartOptions, ChartType } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-top-selling-products',
  imports: [NgChartsModule, NgClass],
  templateUrl: './top-selling-products.component.html',
  styleUrl: './top-selling-products.component.scss'
})
export class TopSellingProductsComponent implements OnInit {
  chartType: ChartType = 'bar';
  chartData: any;
  chartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Top-Selling Products'
      },
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Product'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Units Sold'
        },
        beginAtZero: true
      }
    }
  };

  private analyticsService = inject(AnalyticsService);
  private router = inject(Router);
  isInDashboard = false;
  

  ngOnInit(): void {
    this.isInDashboard = this.router.url === '/chart';
    
    this.analyticsService.getTopSellingProducts().subscribe(data => {
      console.log(data);
      this.chartData = {
        labels: data.map(p => p.productName),
        datasets: [
          {
            data: data.map(p => p.totalQuantitySold),
            label: 'Units Sold',
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }
        ]
      };
    });
  }
}
