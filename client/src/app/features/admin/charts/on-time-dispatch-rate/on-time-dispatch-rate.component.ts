import { Component, inject, OnInit } from '@angular/core';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { ChartType, ChartOptions, ChartData } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { CommonModule, NgClass } from '@angular/common';
import { ViewChild } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { Router } from '@angular/router';

@Component({
  selector: 'app-on-time-dispatch-rate',
  standalone: true,
  imports: [NgChartsModule, CommonModule, NgClass],
  templateUrl: './on-time-dispatch-rate.component.html',
  styleUrls: ['./on-time-dispatch-rate.component.scss']
})
export class OnTimeDispatchRateComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);
  private router = inject(Router);
  isInDashboard = false;
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  chartData: ChartData<'doughnut'> = {
    labels: ['On-Time', 'Late'],
    datasets: [
      {
        data: [],
        backgroundColor: ['#36A2EB', '#FF6384']
      }
    ]
  };

  chartType: ChartType = 'doughnut';
  chartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'right' },
      title: {
        display: true,
        text: 'On-Time Dispatch Rate'
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.raw;
            return `Orders: ${value}`;
          }
        }
      }
    }
  };

  ngOnInit(): void {
    this.isInDashboard = this.router.url === '/chart';
    this.loadOnTimeDispatchRate();
  }

  loadOnTimeDispatchRate() {
    this.analyticsService.getOnTimeDispatch().subscribe(data => {
      const onTime = data.onTimeDeliveries;
      const late = data.eligibleOrders - data.onTimeDeliveries;

      this.chartData.datasets[0].data = [onTime, late];
      this.chart?.update();
    });
  }
}
