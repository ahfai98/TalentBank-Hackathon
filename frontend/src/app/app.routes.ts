import { Routes } from '@angular/router';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { PortfolioViewComponent } from './portfolio-view/portfolio-view.component';
import { PortfolioDashboardComponent } from './portfolio-dashboard/portfolio-dashboard.component';

export const routes: Routes = [
  { path: 'employees', component: EmployeeListComponent },
  { path: 'portfolio', component: PortfolioViewComponent },
  { path: 'dashboard', component: PortfolioDashboardComponent },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
];