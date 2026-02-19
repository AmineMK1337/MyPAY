import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface AuthResponse {
  token: string;
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private apiUrl = 'http://localhost:8088/api/auth';
  private currentUser = new BehaviorSubject<AuthResponse | null>(null);

  currentUser$ = this.currentUser.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    const stored = localStorage.getItem('mypay_user');
    if (stored) {
      this.currentUser.next(JSON.parse(stored));
    }
  }

  signup(request: SignupRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/signup`, request).pipe(
      tap(response => this.storeUser(response))
    );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(response => this.storeUser(response))
    );
  }

  logout(): void {
    localStorage.removeItem('mypay_user');
    localStorage.removeItem('mypay_token');
    this.currentUser.next(null);
    this.router.navigate(['/']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('mypay_token');
  }

  getToken(): string | null {
    return localStorage.getItem('mypay_token');
  }

  private storeUser(response: AuthResponse): void {
    localStorage.setItem('mypay_token', response.token);
    localStorage.setItem('mypay_user', JSON.stringify(response));
    this.currentUser.next(response);
  }
}
