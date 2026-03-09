import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface Payment {
  id: string;
  description: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'late';
  category: 'card' | 'bank' | 'shopping' | 'subscription';
}

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-history.component.html',
  styleUrl: './payment-history.component.scss'
})
export class PaymentHistoryComponent {
  payments: Payment[] = [
    { id: 'PAY-001', description: 'Monthly Subscription - Premium Plan', amount: 49.99, date: '2026-03-08', status: 'paid', category: 'subscription' },
    { id: 'PAY-002', description: 'Transfer to Business Account', amount: 1250, date: '2026-03-07', status: 'paid', category: 'bank' },
    { id: 'PAY-003', description: 'Credit Card Payment', amount: 856.5, date: '2026-03-06', status: 'pending', category: 'card' },
    { id: 'PAY-004', description: 'Online Shopping - Electronics', amount: 324.99, date: '2026-03-05', status: 'paid', category: 'shopping' },
    { id: 'PAY-005', description: 'Insurance Premium', amount: 180, date: '2026-03-03', status: 'late', category: 'subscription' },
    { id: 'PAY-006', description: 'Utility Bill Payment', amount: 95.5, date: '2026-03-02', status: 'paid', category: 'bank' },
    { id: 'PAY-007', description: 'Mobile Phone Bill', amount: 65, date: '2026-03-01', status: 'paid', category: 'subscription' },
    { id: 'PAY-008', description: 'Merchant Payment', amount: 234.75, date: '2026-02-28', status: 'pending', category: 'shopping' }
  ];

  get stats() {
    return {
      total: this.payments.reduce((sum, p) => sum + p.amount, 0),
      paid: this.payments.filter((p) => p.status === 'paid').length,
      pending: this.payments.filter((p) => p.status === 'pending').length,
      late: this.payments.filter((p) => p.status === 'late').length
    };
  }

  statusLabel(status: Payment['status']): string {
    if (status === 'paid') return 'Paid';
    if (status === 'pending') return 'Pending';
    return 'Late';
  }

  statusClass(status: Payment['status']): string {
    return {
      paid: 'badge badge-paid',
      pending: 'badge badge-pending',
      late: 'badge badge-late'
    }[status];
  }

  categoryIcon(category: Payment['category']): string {
    return {
      card: '💳',
      bank: '🏦',
      shopping: '🛍️',
      subscription: '📱'
    }[category];
  }
}
