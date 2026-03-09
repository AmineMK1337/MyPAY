import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { AuthService, AuthResponse } from '../../services/auth';
import { ContractService, ContractResponse } from '../../services/contract';
import { PaymentRecord, PaymentService } from '../../services/payment';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, RouterLinkActive],
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
    this.paymentService.getMyPayments().subscribe(apiPayments => {
      const merged = this.mergePaymentsWithLocalCache(apiPayments);
      this.paymentCount = merged.filter(payment => payment.status === 'SUCCESS').length;
      this.monthlyExpense = this.calculateCurrentMonthExpense(merged);
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
      return Array.isArray(parsed) ? (parsed as PaymentRecord[]) : [];
    } catch {
      return [];
    }
  }

  private calculateCurrentMonthExpense(payments: PaymentRecord[]): number {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    return payments
      .filter(payment => payment.status === 'SUCCESS')
      .filter(payment => {
        const paymentDate = new Date(payment.paymentDate || payment.createdAt);
        return !Number.isNaN(paymentDate.getTime()) &&
          paymentDate.getFullYear() === year &&
          paymentDate.getMonth() === month;
      })
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
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
