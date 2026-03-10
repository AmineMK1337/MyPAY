import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-signup',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class SignupComponent {
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  phone = '';
  errorMessage = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.loading = true;
    this.errorMessage = '';

    console.log('📤 Envoi de la requête d\'inscription:', {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone
    });

    this.authService.signup({
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password,
      phone: this.phone
    }).subscribe({
      next: (response) => {
        this.loading = false;
        console.log('✅ Inscription réussie:', response);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        console.error('❌ Erreur d\'inscription:', err);
        console.error('Détails de l\'erreur:', {
          status: err.status,
          statusText: err.statusText,
          error: err.error,
          message: err.message
        });
        
        if (err.status === 0) {
          this.errorMessage = 'Impossible de se connecter au serveur. Vérifiez que le backend est démarré.';
        } else if (err.status === 400) {
          this.errorMessage = err.error?.message || 'Données invalides. Vérifiez tous les champs.';
        } else if (err.status === 409 || err.error?.message?.includes('already exists')) {
          this.errorMessage = 'Cet email est déjà utilisé.';
        } else {
          this.errorMessage = err.error?.message || err.message || 'Erreur lors de l\'inscription';
        }
      }
    });
  }
}
