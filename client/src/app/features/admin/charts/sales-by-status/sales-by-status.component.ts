import { Component, OnInit, inject } from '@angular/core';
import { NgChartsModule } from 'ng2-charts';
import { ChartType, ChartOptions } from 'chart.js';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';


@Component({
  selector: 'app-sales-by-status',
  imports: [
    NgChartsModule, NgClass
  ],
  templateUrl: './sales-by-status.component.html',
  styleUrl: './sales-by-status.component.scss'
})
export class SalesByStatusComponent implements OnInit {
  private router = inject(Router);
  isInDashboard = false;

  chartData: any = {
  labels: [],
  datasets: []
};
  chartType: ChartType = 'pie';
  chartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Sales Breakdown by Status'
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
    this.isInDashboard = this.router.url === '/chart';

    this.analyticsService.getSalesByStatus().subscribe(data => {
      console.log('API data:', data);
      this.chartData = {
        labels: data.map(d => d.status),
        datasets: [
          {
            data: data.map(d => d.totalRevenue),
            backgroundColor: this.generateColors(data.length)
          }
        ]
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
