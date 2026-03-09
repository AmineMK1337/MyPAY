import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';
import { environment } from '../../environments/environment';

export interface PaymentHistoryItem {
  id: string;
  description: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'late';
  category: 'card' | 'bank' | 'shopping' | 'subscription' | 'insurance';
}

export interface ExpenseCategory {
  name: string;
  amount: number;
  color: string;
  percentage: number;
  icon: string;
}

export interface MonthlyTrend {
  month: string;
  amount: number;
}

export interface MonthlyAnalytics {
  projectedExpenses: number;
  budgetLimit: number;
  expenseData: ExpenseCategory[];
  monthlyTrend: MonthlyTrend[];
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = `${environment.apiUrl}/analytics`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getPaymentHistory(): Observable<ApiResponse<PaymentHistoryItem[]>> {
    return this.http.get<ApiResponse<PaymentHistoryItem[]>>(
      `${this.apiUrl}/payment-history`,
      { headers: this.getHeaders() }
    );
  }

  getMonthlyForecast(): Observable<ApiResponse<MonthlyAnalytics>> {
    return this.http.get<ApiResponse<MonthlyAnalytics>>(
      `${this.apiUrl}/monthly-forecast`,
      { headers: this.getHeaders() }
    );
  }
}
