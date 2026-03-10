import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing';
import { LoginComponent } from './pages/login/login';
import { SignupComponent } from './pages/signup/signup';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { AddContractComponent } from './pages/add-contract/add-contract';
import { PaymentComponent } from './pages/payment/payment';
import { ProfileComponent } from './pages/profile/profile';
import { AlerteLayoutComponent } from './pages/alerte/alerte-layout.component';
import { PaymentHistoryComponent } from './pages/alerte/payment-history.component';
import { MonthlyForecastComponent } from './pages/alerte/monthly-forecast.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'add-contract', component: AddContractComponent, canActivate: [authGuard] },
  { path: 'payment', component: PaymentComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  {
    path: 'alerte',
    component: AlerteLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: PaymentHistoryComponent },
      { path: 'forecast', component: MonthlyForecastComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
