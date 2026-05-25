import { Component, OnInit, signal, computed } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, Employee } from '../api.service';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [FormsModule, NgClass],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css'],
})
export class EmployeeListComponent implements OnInit {
  employees = signal<(Employee & { selected: boolean })[]>([]);
  loading = signal(false);

  selectedCount = computed(() => this.employees().filter(e => e.selected).length);
  allSelected   = computed(() => this.employees().length > 0 && this.employees().every(e => e.selected));
  someSelected  = computed(() => this.employees().some(e => e.selected) && !this.allSelected());
  criticalCount = computed(() => this.employees().filter(e => e.jobRole.riskScore >= 90).length);
  highCount     = computed(() => this.employees().filter(e => e.jobRole.riskScore >= 70 && e.jobRole.riskScore < 90).length);

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void { this.loadEmployees(); }

  loadEmployees(): void {
    this.loading.set(true);
    this.api.getHighRiskEmployees().subscribe({
      next: (data) => {
        const sorted = (Array.isArray(data) ? data : [])
          .sort((a, b) => b.jobRole.riskScore - a.jobRole.riskScore);
        this.employees.set(sorted.map(emp => ({ ...emp, selected: true }))); // pre-select all
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load employees', err);
        this.employees.set([]);
        this.loading.set(false);
      },
    });
  }

  toggleAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.employees.update(list => list.map(e => ({ ...e, selected: checked })));
  }

  // Needed to trigger signal update since ngModel mutates object directly
  onCheckChange(): void {
    this.employees.update(list => [...list]);
  }

  proceedToPortfolio(): void {
    const selectedIds = this.employees().filter(e => e.selected).map(e => e.employeeId);
    if (selectedIds.length === 0) return;
    this.router.navigate(['/portfolio'], { queryParams: { ids: selectedIds.join(',') } });
  }

  riskClass(score: number): string {
    if (score >= 90) return 'critical';
    if (score >= 70) return 'high';
    return 'medium';
  }

  riskLabel(score: number): string {
    if (score >= 90) return 'Critical';
    if (score >= 70) return 'High';
    return 'Medium';
  }
}
