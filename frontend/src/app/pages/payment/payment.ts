import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth';
import { OnlinePaymentRequest, PaymentService, UpcomingPayment } from '../../services/payment';
import { ContractService } from '../../services/contract';
import { catchError, finalize, map, of, switchMap, throwError } from 'rxjs';

interface SelectedContract {
  contractId: string;
  title: string;
  dueDate: string;
  amount: number;
  mode: string;
}

@Component({
  selector: 'app-payment',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './payment.html',
  styleUrl: './payment.scss',
})
export class PaymentComponent implements OnInit {
  readonly cardNumberPattern = '^[0-9 ]{12,23}$';
  readonly expiryPattern = '^(0[1-9]|1[0-2])\\s?/\\s?[0-9]{2}$';
  readonly cvcPattern = '^[0-9]{3,4}$';

  upcomingPayments: UpcomingPayment[] = [];
  loadingUpcoming = false;
  submitting = false;
  errorMessage = '';
  successMessage = '';
  selectedContractId = '';
  selectedContract: SelectedContract | null = null;

  form: OnlinePaymentRequest = {
    email: '',
    amount: 0,
    cardNumber: '',
    expiry: '',
    cvc: '',
    cardholderName: '',
    contractId: '',
  };

  constructor(
    private paymentService: PaymentService,
    private contractService: ContractService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const user = localStorage.getItem('mypay_user');
    if (user) {
      const parsed = JSON.parse(user) as { email?: string };
      this.form.email = parsed.email ?? '';
    }

    if (!this.initializeFromDashboardSelection()) {
      this.form.amount = 145.0;
      this.loadUpcomingPayments();
    }
  }

  loadUpcomingPayments(): void {
    this.loadingUpcoming = true;
    this.paymentService.getUpcomingPayments().subscribe({
      next: payments => {
        this.upcomingPayments = payments;
        this.loadingUpcoming = false;
      },
      error: () => {
        this.loadingUpcoming = false;
      },
    });
  }

  selectUpcomingPayment(payment: UpcomingPayment): void {
    this.selectedContract = {
      contractId: payment.contractId,
      title: payment.title,
      dueDate: payment.dueDate,
      amount: payment.amount,
      mode: payment.mode,
    };
    this.form.amount = payment.amount;
    this.selectedContractId = payment.contractId;
    this.form.contractId = payment.contractId;
  }

  submitPayment(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.isCardFormValid()) {
      this.errorMessage = 'Format invalide: verifiez numero de carte, expiration (MM/AA) et CVC.';
      return;
    }

    this.submitting = true;
    const contractIdToDelete = this.selectedContractId || this.form.contractId || '';
    const paidAmount = this.form.amount;
    this.form.contractId = contractIdToDelete;

    this.paymentService.payOnline(this.form).pipe(
      switchMap(response => {
        if (!contractIdToDelete) {
          return of(response);
        }

        return this.contractService.deleteContract(contractIdToDelete).pipe(
          map(() => response),
          catchError(err => throwError(() => err))
        );
      }),
      finalize(() => {
        this.submitting = false;
      })
    ).subscribe({
      next: response => {
        this.successMessage = `Paiement confirme (${response.maskedCard})`;
        this.persistPaymentLocally(response.paymentId, paidAmount);
        this.persistLastPaymentFlag(response.paymentId, paidAmount);
        this.form.cardNumber = '';
        this.form.expiry = '';
        this.form.cvc = '';
        this.removeContractFromLocalCache(contractIdToDelete);
        localStorage.removeItem('mypay_selected_contract');
        window.alert('Paiement avec succes. Le contrat a ete retire de la liste.');
        setTimeout(() => this.router.navigate(['/dashboard']), 600);
      },
      error: (error: HttpErrorResponse | Error) => {
        const backendError = (error as HttpErrorResponse).error as { message?: string } | undefined;
        this.errorMessage = backendError?.message ?? error.message ?? 'Paiement impossible. Verifiez les informations saisies.';
      },
    });
  }

  formatCardNumber(): void {
    const digits = this.form.cardNumber.replace(/\D/g, '').slice(0, 19);
    this.form.cardNumber = digits.replace(/(.{4})/g, '$1 ').trim();
  }

  formatExpiry(): void {
    const digits = this.form.expiry.replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) {
      this.form.expiry = digits;
      return;
    }
    this.form.expiry = `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  formatCvc(): void {
    this.form.cvc = this.form.cvc.replace(/\D/g, '').slice(0, 4);
  }

  private isCardFormValid(): boolean {
    const cardRegex = new RegExp(this.cardNumberPattern);
    const expiryRegex = new RegExp(this.expiryPattern);
    const cvcRegex = new RegExp(this.cvcPattern);

    return (
      cardRegex.test(this.form.cardNumber) &&
      expiryRegex.test(this.form.expiry) &&
      cvcRegex.test(this.form.cvc)
    );
  }

  private initializeFromDashboardSelection(): boolean {
    const stateContract = history.state?.contract as Partial<SelectedContract> | undefined;
    const queryMap = this.route.snapshot.queryParamMap;

    const queryContractId = queryMap.get('contractId') ?? '';
    const queryTitle = queryMap.get('title') ?? '';
    const queryDueDate = queryMap.get('dueDate') ?? '';
    const queryMode = queryMap.get('mode') ?? 'MANUAL';
    const queryAmount = Number(queryMap.get('amount') ?? '');

    const fallbackRaw = localStorage.getItem('mypay_selected_contract');
    const fallbackContract = fallbackRaw ? (JSON.parse(fallbackRaw) as Partial<SelectedContract>) : undefined;

    const contractId = stateContract?.contractId || queryContractId || fallbackContract?.contractId || '';
    const amountCandidate = stateContract?.amount ?? queryAmount ?? fallbackContract?.amount;
    const amount = Number(amountCandidate);

    if (!contractId || Number.isNaN(amount) || amount <= 0) {
      return false;
    }

    this.selectedContract = {
      contractId,
      title: stateContract?.title || queryTitle || fallbackContract?.title || 'Contrat',
      dueDate: stateContract?.dueDate || queryDueDate || fallbackContract?.dueDate || 'Date non precisee',
      amount,
      mode: stateContract?.mode || queryMode || fallbackContract?.mode || 'MANUAL',
    };

    this.selectedContractId = contractId;
    this.form.contractId = contractId;
    this.form.amount = amount;

    localStorage.setItem('mypay_selected_contract', JSON.stringify(this.selectedContract));
    return true;
  }

  private removeContractFromLocalCache(contractId: string): void {
    if (!contractId) {
      return;
    }

    const cacheRaw = localStorage.getItem('mypay_contracts_cache');
    if (!cacheRaw) {
      return;
    }

    try {
      const list = JSON.parse(cacheRaw) as Array<{ id: string }>;
      const updated = Array.isArray(list) ? list.filter(item => item.id !== contractId) : [];
      localStorage.setItem('mypay_contracts_cache', JSON.stringify(updated));
    } catch {
      localStorage.removeItem('mypay_contracts_cache');
    }
  }

  private persistPaymentLocally(paymentId: string, amount: number): void {
    const cacheKey = 'mypay_payments_cache';
    const raw = localStorage.getItem(cacheKey);
    let current: Array<{ id: string; amount: number; status: string; paymentDate: string; createdAt?: string }> = [];

    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        current = Array.isArray(parsed) ? parsed : [];
      } catch {
        current = [];
      }
    }

    const stableId = paymentId || `PAY-${Date.now()}`;
    const withoutSameId = current.filter(item => item.id !== stableId);
    const nowIso = new Date().toISOString();
    withoutSameId.push({
      id: stableId,
      amount: Number(amount || 0),
      status: 'SUCCESS',
      paymentDate: nowIso,
      createdAt: nowIso,
    });

    localStorage.setItem(cacheKey, JSON.stringify(withoutSameId));
  }

  private persistLastPaymentFlag(paymentId: string, amount: number): void {
    const flagKey = 'mypay_last_payment';
    const payload = {
      id: paymentId || `PAY-${Date.now()}`,
      amount: Number(amount || 0),
      status: 'SUCCESS',
      paymentDate: new Date().toISOString(),
    };
    localStorage.setItem(flagKey, JSON.stringify(payload));
  }
}
