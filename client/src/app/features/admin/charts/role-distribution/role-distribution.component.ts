import { Component, OnInit, inject } from '@angular/core';
import { ChartOptions, ChartType } from 'chart.js';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { CommonModule, NgClass } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { Router } from '@angular/router';

@Component({
  selector: 'app-role-distribution',
  standalone: true,
  imports: [CommonModule, NgChartsModule, NgClass],
  templateUrl: './role-distribution.component.html',
  styleUrls: ['./role-distribution.component.scss']
})
export class RoleDistributionComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);
  private router = inject(Router);
  isInDashboard = false;

  roleLabels: string[] = [];
  roleData: number[] = [];

  roleChartType: ChartType = 'pie';

  roleChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Users by Role' }
    }
  };

  ngOnInit(): void {
    this.isInDashboard = this.router.url === '/chart';
    this.loadRoleDistribution();
  }

  private loadRoleDistribution(): void {
    this.analyticsService.getRoleDistribution().subscribe(data => {
      this.roleLabels = Object.keys(data);
      this.roleData = Object.values(data);
    });
  }
}

