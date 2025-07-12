import { Component, inject, OnInit } from '@angular/core';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { NgChartsModule } from 'ng2-charts';


@Component({
  selector: 'app-sales-chart',
  imports: [
    NgChartsModule
  ],
  templateUrl: './sales-chart.component.html',
  styleUrl: './sales-chart.component.scss'
})
export class SalesChartComponent implements OnInit {
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
