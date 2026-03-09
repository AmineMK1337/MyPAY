import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth';
import { ContractService } from './contract';

export interface UpcomingPayment {
  contractId: string;
  title: string;
  dueDate: string;
  amount: number;
  mode: string;
}

export interface OnlinePaymentRequest {
  email: string;
  amount: number;
  cardNumber: string;
  expiry: string;
  cvc: string;
  cardholderName: string;
  contractId?: string;
}

export interface OnlinePaymentResponse {
  paymentId: string;
  maskedCard: string;
  status: string;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  contractId: string;
  amount: number;
  status: string;
  paymentMethod: string;
  paymentDate: string;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private paymentApiUrl = 'http://localhost:8088/api/payments';

  constructor(
    private contractService: ContractService,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  getUpcomingPayments(): Observable<UpcomingPayment[]> {
    return this.contractService.getContracts().pipe(
      map(resp => {
        const contracts = Array.isArray(resp.data) ? resp.data : [];
        return contracts
          .map(contract => ({
            contractId: contract.id,
            title: contract.contractName,
            dueDate: contract.dueDate,
            amount: contract.amount,
            mode: contract.frequency || 'MANUAL',
          }))
          .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
      }),
      catchError(() => of([]))
    );
  }

  payOnline(request: OnlinePaymentRequest): Observable<OnlinePaymentResponse> {
    return this.http
      .post<ApiResponse<OnlinePaymentResponse>>(`${this.paymentApiUrl}/online`, request, {
        headers: this.getHeaders(),
      })
      .pipe(
        map(resp => {
          if (!resp.success || !resp.data) {
            throw new Error(resp.message || 'Payment failed');
          }
          return resp.data;
        })
      );
  }

  getMyPayments(): Observable<PaymentRecord[]> {
    return this.http
      .get<ApiResponse<PaymentRecord[]>>(`${this.paymentApiUrl}/mine`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map(resp => {
          if (!resp.success) {
            throw new Error(resp.message || 'Unable to load payments');
          }
          return Array.isArray(resp.data) ? resp.data : [];
        }),
        catchError(() => of([]))
      );
  }
}
