import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PortfolioStateService } from '../portfolio-state.service';

@Component({
  selector: 'app-portfolio-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './portfolio-dashboard.component.html',
  styleUrls: ['./portfolio-dashboard.component.css']
})
export class PortfolioDashboardComponent {
  public portfolioState = inject(PortfolioStateService);
}