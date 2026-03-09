import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AnalyticsService, PaymentHistoryItem } from '../../services/analytics';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-history.component.html',
  styleUrl: './payment-history.component.scss'
})
export class PaymentHistoryComponent implements OnInit {
  payments: PaymentHistoryItem[] = [];
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
    this.loadPaymentHistory();

    // Reload data when navigating back to this page
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd && event.urlAfterRedirects === '/alerte'))
      .subscribe(() => {
        this.loadPaymentHistory();
      });
  }

  loadPaymentHistory(): void {
    this.loading = true;
    this.errorMessage = '';
    this.analyticsService.getPaymentHistory().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.payments = [...response.data];
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading payment history:', err);
        this.errorMessage = 'Impossible de charger l\'historique des paiements';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get stats() {
    return {
      total: this.payments.reduce((sum, p) => sum + p.amount, 0),
      paid: this.payments.filter((p) => p.status === 'paid').length,
      pending: this.payments.filter((p) => p.status === 'pending').length,
      late: this.payments.filter((p) => p.status === 'late').length
    };
  }

  statusLabel(status: PaymentHistoryItem['status']): string {
    if (status === 'paid') return 'Payé';
    if (status === 'pending') return 'En attente';
    return 'En retard';
  }

  statusClass(status: PaymentHistoryItem['status']): string {
    return {
      paid: 'badge badge-paid',
      pending: 'badge badge-pending',
      late: 'badge badge-late'
    }[status];
  }

  categoryIcon(category: PaymentHistoryItem['category']): string {
    return {
      card: '💳',
      bank: '🏦',
      shopping: '🛍️',
      subscription: '📱',
      insurance: '🛡️'
    }[category];
  }
}
