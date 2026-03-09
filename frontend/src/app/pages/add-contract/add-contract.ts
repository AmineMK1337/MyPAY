import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ContractService } from '../../services/contract';

@Component({
  selector: 'app-add-contract',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-contract.html',
  styleUrls: ['./add-contract.scss']
})
export class AddContractComponent {
  contractType = '';
  contractName = '';
  provider = '';
  amount = '';
  dueDate = '';
  frequency = '';
  notifyBefore = true;
  remindDays = false;
  alertDelay = true;
  loading = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private contractService: ContractService
  ) {}

  onSubmit() {
    if (!this.contractType || !this.contractName || !this.provider || !this.amount || !this.dueDate || !this.frequency) {
      this.errorMessage = 'Tous les champs sont requis';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const contractData = {
      contractType: this.contractType,
      contractName: this.contractName,
      provider: this.provider,
      amount: parseFloat(this.amount),
      dueDate: this.dueDate,
      frequency: this.frequency,
      notifications: {
        notifyBefore: this.notifyBefore,
        remindDays: this.remindDays,
        alertDelay: this.alertDelay
      }
    };

    console.log('📤 Sending contract data:', contractData);

    this.contractService.createContract(contractData).subscribe(
      (response) => {
        this.loading = false;
        console.log('✅ Contrat créé avec succès:', response);
        alert('Contrat ajouté avec succès!');
        this.router.navigate(['/dashboard']);
      },
      (error) => {
        this.loading = false;
        console.error('❌ Erreur complète:', error);
        this.errorMessage = error.error?.message || error.message || 'Erreur lors de la création du contrat';
        console.error('Message d\'erreur:', this.errorMessage);
      }
    );
  }

  onCancel() {
    this.router.navigate(['/dashboard']);
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
