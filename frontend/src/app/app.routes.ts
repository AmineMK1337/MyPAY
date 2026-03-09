import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing';
import { LoginComponent } from './pages/login/login';
import { SignupComponent } from './pages/signup/signup';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { AddContractComponent } from './pages/add-contract/add-contract';
import { PaymentComponent } from './pages/payment/payment';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'add-contract', component: AddContractComponent },
  { path: 'payment', component: PaymentComponent },
  { path: '**', redirectTo: '' }
];
