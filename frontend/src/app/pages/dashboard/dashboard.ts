import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { AuthService, AuthResponse } from '../../services/auth';
import { ContractService, ContractResponse } from '../../services/contract';
import { PaymentRecord, PaymentService } from '../../services/payment';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit {
  user: AuthResponse | null = null;
  contracts: ContractResponse[] = [];
  contractCount = 0;
  upcomingCount = 0;
  paymentCount = 0;
  monthlyExpense = 0;
  loadError = '';
  deletingContractId: string | null = null;
  private readonly contractsCacheKey = 'mypay_contracts_cache';
  private readonly paymentsCacheKey = 'mypay_payments_cache';

  constructor(
    private authService: AuthService,
    private router: Router,
    private contractService: ContractService,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.authService.currentUser$.subscribe(user => (this.user = user));
    this.restoreCachedContracts();
    this.loadContracts();
    this.loadPaymentsCount();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd && event.urlAfterRedirects === '/dashboard'))
      .subscribe(() => {
        this.loadContracts();
        this.loadPaymentsCount();
      });
  }

  loadContracts(): void {
    this.loadError = '';
    this.contractService.getContracts().subscribe(
      resp => {
        if (!resp?.success) {
          this.loadError = resp?.message || 'Impossible de charger les contrats';
          return;
        }

        this.contracts = Array.isArray(resp.data) ? resp.data : [];
        this.refreshContractStats();
        localStorage.setItem(this.contractsCacheKey, JSON.stringify(this.contracts));
      },
      err => {
        this.loadError = err?.error?.message || 'Erreur serveur lors du chargement des contrats';

        if (this.contracts.length === 0) {
          this.contractCount = 0;
          this.upcomingCount = 0;
        }
      }
    );
  }

  getUrgencyClass(dueDate: string): 'urgent' | 'near' | 'safe' {
    const daysUntil = this.getDaysUntil(dueDate);
    if (daysUntil <= 1) {
      return 'urgent';
    }
    if (daysUntil <= 7) {
      return 'near';
    }
    return 'safe';
  }

  getUrgencyLabel(dueDate: string): string {
    const daysUntil = this.getDaysUntil(dueDate);
    if (daysUntil <= 0) {
      return 'Urgent (aujourd hui)';
    }
    if (daysUntil === 1) {
      return 'Urgent (demain)';
    }
    if (daysUntil <= 7) {
      return 'Proche';
    }
    return 'Loin';
  }

  deleteContract(contract: ContractResponse): void {
    const confirmed = window.confirm(`Tu veux vraiment supprimer "${contract.contractName}" ?`);
    if (!confirmed) {
      return;
    }

    this.deletingContractId = contract.id;
    this.contractService.deleteContract(contract.id).subscribe(
      () => {
        this.contracts = this.contracts.filter(item => item.id !== contract.id);
        this.refreshContractStats();
        localStorage.setItem(this.contractsCacheKey, JSON.stringify(this.contracts));
        this.deletingContractId = null;
      },
      err => {
        this.loadError = err?.error?.message || 'Erreur lors de la suppression du contrat';
        this.deletingContractId = null;
      }
    );
  }

  logout(): void {
    this.authService.logout();
  }

  loadPaymentsCount(): void {
    this.applyLastPaymentToCache();

    // Immediate UI update from local cache (works even if backend is slow/unavailable).
    const cached = this.getCachedPayments();
    this.paymentCount = cached.filter(payment => payment.status === 'SUCCESS').length;
    this.monthlyExpense = this.calculateCurrentMonthExpense(cached);

    // Source of truth: backend summary (DB-backed).
    this.paymentService.getMyPaymentSummary().subscribe(summary => {
      if (!summary) {
        return;
      }
      this.paymentCount = Number(summary.successCount || 0);
      this.monthlyExpense = Number(summary.monthTotal || 0);
    });
  }

  makePayment(contract: ContractResponse): void {
    const selectedContract = {
      contractId: contract.id,
      title: contract.contractName,
      dueDate: contract.dueDate,
      amount: contract.amount,
      mode: contract.frequency || 'MANUAL',
    };

    localStorage.setItem('mypay_selected_contract', JSON.stringify(selectedContract));

    this.router.navigate(['/payment'], {
      state: { contract: selectedContract },
      queryParams: selectedContract,
    });
  }

  private getDaysUntil(dueDate: string): number {
    const due = new Date(dueDate);
    const today = new Date();

    if (Number.isNaN(due.getTime())) {
      return Number.MAX_SAFE_INTEGER;
    }

    const dueMidnight = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diffMs = dueMidnight.getTime() - todayMidnight.getTime();

    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }

  private refreshContractStats(): void {
    this.contractCount = this.contracts.length;
    this.upcomingCount = this.contracts.filter(contract => this.getDaysUntil(contract.dueDate) <= 7).length;
  }

  private mergePaymentsWithLocalCache(apiPayments: PaymentRecord[]): PaymentRecord[] {
    const cached = this.getCachedPayments();
    const map = new Map<string, PaymentRecord>();

    apiPayments.forEach(payment => {
      if (payment?.id) {
        map.set(payment.id, payment);
      }
    });

    cached.forEach(payment => {
      if (payment?.id) {
        map.set(payment.id, payment);
      }
    });

    return Array.from(map.values());
  }

  private getCachedPayments(): PaymentRecord[] {
    const raw = localStorage.getItem(this.paymentsCacheKey);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        localStorage.removeItem(this.paymentsCacheKey);
        return [];
      }

      // Accept older/partial shapes from local cache.
      return parsed
        .map((item: any) => {
          const id = String(item?.id ?? item?.paymentId ?? '');
          if (!id) {
            return null;
          }

          return {
            id,
            userId: String(item?.userId ?? ''),
            contractId: String(item?.contractId ?? ''),
            amount: Number(item?.amount ?? 0),
            status: String(item?.status ?? ''),
            paymentMethod: String(item?.paymentMethod ?? ''),
            paymentDate: item?.paymentDate,
            createdAt: item?.createdAt,
          } as PaymentRecord;
        })
        .filter(Boolean) as PaymentRecord[];
    } catch {
      localStorage.removeItem(this.paymentsCacheKey);
      return [];
    }
  }

  private applyLastPaymentToCache(): void {
    const flagKey = 'mypay_last_payment';
    const raw = localStorage.getItem(flagKey);
    if (!raw) {
      return;
    }

    try {
      const last = JSON.parse(raw) as { id?: string; amount?: number; status?: string; paymentDate?: string };
      const id = String(last?.id ?? '');
      if (!id) {
        localStorage.removeItem(flagKey);
        return;
      }

      const existing = this.getCachedPayments();
      const already = existing.some(payment => payment.id === id);
      if (!already) {
        const updated = [
          ...existing,
          {
            id,
            userId: '',
            contractId: '',
            amount: Number(last?.amount ?? 0),
            status: String(last?.status ?? 'SUCCESS'),
            paymentMethod: 'CARD',
            paymentDate: last?.paymentDate ?? new Date().toISOString(),
            createdAt: last?.paymentDate ?? new Date().toISOString(),
          } as PaymentRecord,
        ];

        localStorage.setItem(this.paymentsCacheKey, JSON.stringify(updated));
      }

      // One-time apply to avoid double counting.
      localStorage.removeItem(flagKey);
    } catch {
      localStorage.removeItem(flagKey);
    }
  }

  private calculateCurrentMonthExpense(payments: PaymentRecord[]): number {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    return payments
      .filter(payment => payment.status === 'SUCCESS')
      .filter(payment => {
        const paymentDate = this.parsePaymentDate(payment.paymentDate ?? payment.createdAt);
        return (
          !!paymentDate &&
          paymentDate.getFullYear() === year &&
          paymentDate.getMonth() === month
        );
      })
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  }

  private parsePaymentDate(value: unknown): Date | null {
    if (!value) {
      return null;
    }

    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? null : date;
    }

    // Handle LocalDateTime serialized as array (e.g. [2026,3,11,14,30,0,0]).
    if (Array.isArray(value) && value.length >= 3) {
      const [year, month, day, hour = 0, minute = 0, second = 0] = value as number[];
      const date = new Date(year, (month ?? 1) - 1, day ?? 1, hour ?? 0, minute ?? 0, second ?? 0);
      return Number.isNaN(date.getTime()) ? null : date;
    }

    // Handle LocalDateTime serialized as object (e.g. {year,monthValue,dayOfMonth,...}).
    if (typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      const year = Number(obj['year']);
      const month = Number(obj['monthValue'] ?? obj['month']);
      const day = Number(obj['dayOfMonth'] ?? obj['day']);
      const hour = Number(obj['hour'] ?? 0);
      const minute = Number(obj['minute'] ?? 0);
      const second = Number(obj['second'] ?? 0);

      if ([year, month, day].some(n => Number.isNaN(n))) {
        return null;
      }

      const date = new Date(year, month - 1, day, hour, minute, second);
      return Number.isNaN(date.getTime()) ? null : date;
    }

    return null;
  }

  private restoreCachedContracts(): void {
    const cached = localStorage.getItem(this.contractsCacheKey);
    if (!cached) {
      return;
    }

    try {
      const parsed = JSON.parse(cached);
      this.contracts = Array.isArray(parsed) ? parsed : [];
      this.refreshContractStats();
    } catch {
      this.contracts = [];
      this.contractCount = 0;
      this.upcomingCount = 0;
    }
  }
}
