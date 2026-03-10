import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, AuthResponse } from '../../services/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class ProfileComponent implements OnInit {
  user: AuthResponse | null = null;

  // Editable profile fields
  firstName = '';
  lastName = '';
  email = '';
  phone = '';

  // Settings
  notifyBeforeDue = true;
  notifyOnPayment = true;
  notifyAlerts = true;
  language = 'fr';
  currency = 'TND';

  editMode = false;
  successMessage = '';
  activeTab: 'profile' | 'settings' = 'profile';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      if (user) {
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.email = user.email;
      }
    });

    // Restore saved settings from localStorage
    const savedSettings = localStorage.getItem('mypay_settings');
    if (savedSettings) {
      const s = JSON.parse(savedSettings);
      this.notifyBeforeDue = s.notifyBeforeDue ?? true;
      this.notifyOnPayment = s.notifyOnPayment ?? true;
      this.notifyAlerts = s.notifyAlerts ?? true;
      this.language = s.language ?? 'fr';
      this.currency = s.currency ?? 'TND';
    }
  }

  getInitials(): string {
    if (!this.user) return '?';
    return `${this.user.firstName.charAt(0)}${this.user.lastName.charAt(0)}`.toUpperCase();
  }

  setTab(tab: 'profile' | 'settings'): void {
    this.activeTab = tab;
    this.successMessage = '';
  }

  enableEdit(): void {
    this.editMode = true;
    this.successMessage = '';
  }

  cancelEdit(): void {
    if (this.user) {
      this.firstName = this.user.firstName;
      this.lastName = this.user.lastName;
      this.email = this.user.email;
    }
    this.editMode = false;
  }

  saveProfile(): void {
    if (!this.firstName.trim() || !this.lastName.trim() || !this.email.trim()) return;

    // Update local storage user data
    if (this.user) {
      const updated = { ...this.user, firstName: this.firstName.trim(), lastName: this.lastName.trim(), email: this.email.trim() };
      localStorage.setItem('mypay_user', JSON.stringify(updated));
      // Trigger re-emit via service
      (this.authService as any)['currentUser'].next(updated);
    }

    this.editMode = false;
    this.successMessage = 'Profil mis à jour avec succès.';
    setTimeout(() => (this.successMessage = ''), 3000);
  }

  saveSettings(): void {
    const settings = {
      notifyBeforeDue: this.notifyBeforeDue,
      notifyOnPayment: this.notifyOnPayment,
      notifyAlerts: this.notifyAlerts,
      language: this.language,
      currency: this.currency
    };
    localStorage.setItem('mypay_settings', JSON.stringify(settings));
    this.successMessage = 'Paramètres enregistrés avec succès.';
    setTimeout(() => (this.successMessage = ''), 3000);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this.authService.logout();
  }
}
