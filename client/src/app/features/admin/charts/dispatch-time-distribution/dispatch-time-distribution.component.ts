import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { ChartOptions, ChartData } from 'chart.js';
import { NgChartsModule, BaseChartDirective } from 'ng2-charts';
import { CommonModule, NgClass } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dispatch-time-distribution',
  standalone: true,
  imports: [NgChartsModule, CommonModule, NgClass],
  templateUrl: './dispatch-time-distribution.component.html',
  styleUrls: ['./dispatch-time-distribution.component.scss']
})
export class DispatchTimeDistributionComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);
  private router = inject(Router);
  isInDashboard = false;
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

chartData: ChartData<'bar'> = {
  labels: [],
  datasets: [
    {
      label: 'Dispatch Times Frequency',
      data: [],
      backgroundColor: '#36A2EB'
    }
  ]
};

chartOptions: ChartOptions<'bar'> = {
  responsive: true,
  scales: {
    x: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Time'
      }
    },
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Frequency'
      },
      ticks: { stepSize: 1 }
    }
  },
  plugins: {
    legend: { display: false },
    title: {
      display: true,
      text: 'Dispatch Time Distribution'
    }
  }
};

chartType: 'bar' = 'bar';

ngOnInit(): void {
  this.isInDashboard = this.router.url === '/chart';
  this.analyticsService.getDispatchTimeDistribution().subscribe(data => {
    this.chartData.labels = data.map((d: any) => d.label);
    this.chartData.datasets[0].data = data.map((d: any) => d.count);
    this.chart?.update();
  });
}
}
