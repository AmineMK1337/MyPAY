import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing';
import { LoginComponent } from './pages/login/login';
import { SignupComponent } from './pages/signup/signup';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { AlerteLayoutComponent } from './pages/alerte/alerte-layout.component';
import { PaymentHistoryComponent } from './pages/alerte/payment-history.component';
import { MonthlyForecastComponent } from './pages/alerte/monthly-forecast.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'dashboard', component: DashboardComponent },
  {
    path: 'alerte',
    component: AlerteLayoutComponent,
    children: [
      { path: '', component: PaymentHistoryComponent },
      { path: 'forecast', component: MonthlyForecastComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
