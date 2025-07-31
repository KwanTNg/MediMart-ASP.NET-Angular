import { Component, inject, OnInit } from '@angular/core';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { NgChartsModule } from 'ng2-charts';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';


@Component({
  selector: 'app-sales-chart',
  imports: [
    NgChartsModule, NgClass
  ],
  templateUrl: './sales-chart.component.html',
  styleUrl: './sales-chart.component.scss'
})
export class SalesChartComponent implements OnInit {
  private router = inject(Router);
  isInDashboard = false;

  lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: []
  };

  chartLabels: string[] = [];
  chartData: number[] = [];

  chartOptions: ChartOptions = {
    responsive: true,
    plugins: {
    legend: {
      display: true
    },
    title: {
      display: true,
      text: 'Sales Over Time'
    },
      tooltip: {
      callbacks: {
        label: function (context) {
          const value = context.raw;
          return `£${value}`;
        }
        }
      }
  },
  scales: {
    x: {
      title: {
        display: true,
        text: 'Date'
      }
    },
    y: {
      title: {
        display: true,
        text: 'Revenue (GBP)'
      }
    }
  }
  };

  chartType: ChartType = 'line';

  private analyticsService = inject(AnalyticsService);

  ngOnInit(): void {
    this.isInDashboard = this.router.url === '/chart';

    this.analyticsService.getSalesOverTime().subscribe(data => {
      this.lineChartData = {
        labels: data.map(d => d.date.toLocaleDateString()),
        datasets: [
          {
            data: data.map(d => d.totalRevenue),
            label: 'Revenue',
            fill: true,
            tension: 0.4,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)'
          }
        ]
      };
    });
  }
}
