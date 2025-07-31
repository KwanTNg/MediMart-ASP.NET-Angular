import { Component, inject, OnInit } from '@angular/core';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { ChartType, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-delivery-distribution',
  standalone: true,
  imports: [NgChartsModule, NgClass],
  templateUrl: './delivery-distribution.component.html',
  styleUrls: ['./delivery-distribution.component.scss']
})
export class DeliveryDistributionComponent implements OnInit {
  private router = inject(Router);
  isInDashboard = false;
  private analyticsService = inject(AnalyticsService);

  deliveryChartLabels: string[] = [];
  deliveryChartData: number[] = [];

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
        text: 'Delivery Type Distribution'
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.raw;
            return `${context.label}: ${value}`;
          }
        }
      }
    }
  };

  ngOnInit(): void {
    this.isInDashboard = this.router.url === '/chart';
    this.loadDeliveryDistribution();
  }

  loadDeliveryDistribution() {
    this.analyticsService.getDeliveryDistribution().subscribe(data => {
      this.deliveryChartLabels = data.map(d => d.deliveryType);
      this.deliveryChartData = data.map(d => d.count);

      this.chartData = {
        labels: this.deliveryChartLabels,
        datasets: [{
          data: this.deliveryChartData,
          backgroundColor: this.generateColors(this.deliveryChartData.length)
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
