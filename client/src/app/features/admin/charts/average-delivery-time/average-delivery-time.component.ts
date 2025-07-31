import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { ChartOptions, ChartType, ChartData } from 'chart.js';
import { NgChartsModule, BaseChartDirective } from 'ng2-charts';
import { CommonModule, NgClass } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-average-delivery-time',
  standalone: true,
  imports: [NgChartsModule, CommonModule, NgClass],
  templateUrl: './average-delivery-time.component.html',
  styleUrls: ['./average-delivery-time.component.scss']
})
export class AverageDeliveryTimeComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);
  private router = inject(Router);
  isInDashboard = false;
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  chartData: ChartData<'bar'> = {
    labels: ['Avg Delivery Time (Days)'],
    datasets: [
      {
        label: 'Average Delivery Time',
        data: [0],
        backgroundColor: ['#36A2EB']
      }
    ]
  };

  chartOptions: ChartOptions = {
    responsive: true,
    indexAxis: 'y',
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        },
        title: {
          display: true,
          text: 'Days'
        }
      }
    },
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Average Delivery Time in Days'
      }
    }
  };

  chartType: ChartType = 'bar';

  ngOnInit(): void {
    this.isInDashboard = this.router.url === '/chart';
    this.analyticsService.getAverageDeliveryTime().subscribe(avg => {
      this.chartData.datasets[0].data = [avg];
      this.chart?.update();
    });
  }
}
