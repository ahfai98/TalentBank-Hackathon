import { Injectable, signal } from '@angular/core';
import { Portfolio } from './api.service';

export interface StoredPortfolio {
  employeeId: string;
  portfolio: Portfolio;
  generatedAt: Date;
}

@Injectable({ providedIn: 'root' })
export class PortfolioStateService {
  private portfoliosSignal = signal<StoredPortfolio[]>([]);
  portfolios = this.portfoliosSignal.asReadonly();

  savePortfolio(employeeId: string, portfolio: Portfolio): void {
    this.portfoliosSignal.update(list => {
      const filtered = list.filter(p => p.employeeId !== employeeId);
      return [...filtered, { employeeId, portfolio, generatedAt: new Date() }];
    });
  }

  clearPortfolios(): void {
    this.portfoliosSignal.set([]);
  }
}