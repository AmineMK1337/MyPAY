import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';
import { environment } from '../../environments/environment';

export interface CreateContractRequest {
  contractType: string;
  contractName: string;
  provider: string;
  amount: number;
  dueDate: string;
  frequency: string;
  notifications: {
    notifyBefore: boolean;
    remindDays: boolean;
    alertDelay: boolean;
  };
}

export interface ContractResponse {
  id: string;
  contractType: string;
  contractName: string;
  provider: string;
  amount: number;
  dueDate: string;
  frequency: string;
  status: string;
  createdAt: number;
  notifications: {
    notifyBefore: boolean;
    remindDays: boolean;
    alertDelay: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  private apiUrl = `${environment.apiUrl}/contracts`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      console.warn('ContractService: no auth token available');
    } else {
      console.log('ContractService using token', token.substring(0,10));
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  createContract(contract: CreateContractRequest): Observable<ApiResponse<ContractResponse>> {
    return this.http.post<ApiResponse<ContractResponse>>(
      this.apiUrl,
      contract,
      { headers: this.getHeaders() }
    );
  }

  getContracts(): Observable<ApiResponse<ContractResponse[]>> {
    return this.http.get<ApiResponse<ContractResponse[]>>(
      this.apiUrl,
      { headers: this.getHeaders() }
    );
  }

  getActiveContracts(): Observable<ApiResponse<ContractResponse[]>> {
    return this.http.get<ApiResponse<ContractResponse[]>>(
      `${this.apiUrl}/active`,
      { headers: this.getHeaders() }
    );
  }

  getContract(id: string): Observable<ApiResponse<ContractResponse>> {
    return this.http.get<ApiResponse<ContractResponse>>(
      `${this.apiUrl}/${id}`,
      { headers: this.getHeaders() }
    );
  }

  updateContract(id: string, contract: CreateContractRequest): Observable<ApiResponse<ContractResponse>> {
    return this.http.put<ApiResponse<ContractResponse>>(
      `${this.apiUrl}/${id}`,
      contract,
      { headers: this.getHeaders() }
    );
  }

  deleteContract(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/${id}`,
      { headers: this.getHeaders() }
    );
  }
}
