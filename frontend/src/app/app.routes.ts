import { Routes } from '@angular/router';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { PortfolioViewComponent } from './portfolio-view/portfolio-view.component';

export const routes: Routes = [
  { path: 'employees', component: EmployeeListComponent },
  { path: 'portfolio',  component: PortfolioViewComponent },
  { path: '', redirectTo: '/employees', pathMatch: 'full' },
];
