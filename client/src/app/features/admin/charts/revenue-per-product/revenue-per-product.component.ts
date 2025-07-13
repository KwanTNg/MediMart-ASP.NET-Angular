import { Component, OnInit, inject } from '@angular/core';
import { NgChartsModule } from 'ng2-charts';
import { ChartType, ChartOptions } from 'chart.js';
import { AnalyticsService } from '../../../../core/services/analytics.service';

@Component({
  selector: 'app-revenue-per-product',
  imports: [
    NgChartsModule
  ],
  templateUrl: './revenue-per-product.component.html',
  styleUrl: './revenue-per-product.component.scss'
})
export class RevenuePerProductComponent implements OnInit {
  chartData: any;
  chartType: ChartType = 'doughnut';
  chartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'right' },
      title: {
        display: true,
        text: 'Revenue Contribution per Product'
      },
      tooltip: {
      callbacks: {
        label: function (context) {
          const value = context.raw;
          return `£${value}`;
        }
        }
      }
    }
  };

  private analyticsService = inject(AnalyticsService);

  ngOnInit(): void {
    this.analyticsService.getRevenuePerProduct().subscribe(data => {
      this.chartData = {
        labels: data.map(d => d.productName),
        datasets: [{
          data: data.map(d => d.totalRevenue),
          backgroundColor: this.generateColors(data.length)
        }]
      };
    });
  }

  private generateColors(count: number): string[] {
    const palette = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
      '#9966FF', '#FF9F40', '#8BC34A', '#E91E63',
      '#00ACC1', '#FF5722', '#9CCC65', '#9575CD'
    ];
    return Array.from({ length: count }, (_, i) => palette[i % palette.length]);
  }
}
