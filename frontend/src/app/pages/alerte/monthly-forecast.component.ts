import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AnalyticsService, ExpenseCategory, MonthlyTrend } from '../../services/analytics';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-monthly-forecast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './monthly-forecast.component.html',
  styleUrl: './monthly-forecast.component.scss'
})
export class MonthlyForecastComponent implements OnInit {
  expenseData: ExpenseCategory[] = [];
  monthlyTrend: MonthlyTrend[] = [];
  projectedExpenses = 0;
  budgetLimit = 0;
  loading = true;
  errorMessage = '';

  constructor(
    private analyticsService: AnalyticsService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadMonthlyForecast();

    // Reload data when navigating back to this page
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd && event.urlAfterRedirects.includes('/alerte/forecast')))
      .subscribe(() => {
        this.loadMonthlyForecast();
      });
  }

  loadMonthlyForecast(): void {
    this.loading = true;
    this.errorMessage = '';
    this.analyticsService.getMonthlyForecast().subscribe({
      next: (response) => {
        console.log('Monthly forecast response:', response);
        if (response.success && response.data) {
          this.expenseData = [...response.data.expenseData];
          this.monthlyTrend = [...response.data.monthlyTrend];
          this.projectedExpenses = response.data.projectedExpenses;
          this.budgetLimit = response.data.budgetLimit;
          this.cdr.detectChanges();
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading monthly forecast:', err);
        this.errorMessage = 'Impossible de charger les prévisions mensuelles';
        this.loading = false;
      }
    });
  }

  get totalExpenses(): number {
    return this.expenseData.reduce((sum, item) => sum + item.amount, 0);
  }

  get budgetUtilization(): number {
    return this.budgetLimit > 0 ? (this.projectedExpenses / this.budgetLimit) * 100 : 0;
  }
}
