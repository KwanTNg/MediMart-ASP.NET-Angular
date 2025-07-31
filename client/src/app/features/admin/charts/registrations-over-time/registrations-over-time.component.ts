import { Component, OnInit, inject } from '@angular/core';
import { ChartOptions, ChartType } from 'chart.js';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { NgChartsModule } from 'ng2-charts';
import { CommonModule, NgClass } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registrations-over-time',
  standalone: true,
  imports: [CommonModule, NgChartsModule, NgClass],
  templateUrl: './registrations-over-time.component.html',
  styleUrls: ['./registrations-over-time.component.scss']
})
export class RegistrationsOverTimeComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);
  private router = inject(Router);
  isInDashboard = false;

  regLabels: string[] = [];
  regData: number[] = [];

  regChartType: ChartType = 'line';

  regChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'User Registrations Over Time' }
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
          text: 'Registrations'
        },
        beginAtZero: true
      }
    }
  };

  ngOnInit(): void {
    this.isInDashboard = this.router.url === '/chart';
    this.loadRegistrations();
  }

  private loadRegistrations(): void {
    this.analyticsService.getRegistrationsOverTime().subscribe(data => {
      this.regLabels = data.map(d => d.date);
      this.regData = data.map(d => d.count);
    });
  }
}
