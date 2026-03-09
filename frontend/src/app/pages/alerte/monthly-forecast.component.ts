import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface ExpenseCategory {
  name: string;
  amount: number;
  color: string;
  percentage: number;
  icon: string;
}

@Component({
  selector: 'app-monthly-forecast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './monthly-forecast.component.html',
  styleUrl: './monthly-forecast.component.scss'
})
export class MonthlyForecastComponent {
  expenseData: ExpenseCategory[] = [
    { name: 'Insurance', amount: 450, color: '#00d4ff', percentage: 22, icon: '🛡️' },
    { name: 'Credit Cards', amount: 680, color: '#a78bfa', percentage: 33, icon: '💳' },
    { name: 'Subscriptions', amount: 245, color: '#10b981', percentage: 12, icon: '📡' },
    { name: 'Rent/Mortgage', amount: 580, color: '#f59e0b', percentage: 28, icon: '🏠' },
    { name: 'Transportation', amount: 95, color: '#ef4444', percentage: 5, icon: '🚗' }
  ];

  monthlyTrend = [
    { month: 'Jan', amount: 1850 },
    { month: 'Feb', amount: 1920 },
    { month: 'Mar', amount: 2050 },
    { month: 'Apr', amount: 2050 },
    { month: 'May', amount: 2050 },
    { month: 'Jun', amount: 2050 }
  ];

  projectedExpenses = 2050;
  budgetLimit = 2500;

  get totalExpenses(): number {
    return this.expenseData.reduce((sum, item) => sum + item.amount, 0);
  }

  get budgetUtilization(): number {
    return (this.projectedExpenses / this.budgetLimit) * 100;
  }
}
