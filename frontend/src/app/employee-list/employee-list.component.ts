import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService, Employee } from '../api.service';
import { ToastService } from '../ui/toast.service';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [FormsModule, NgClass, RouterLink],  
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css'],
})
export class EmployeeListComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private toast = inject(ToastService);

  employees = signal<(Employee & { selected: boolean })[]>([]);
  filteredEmployees = signal<(Employee & { selected: boolean })[]>([]);
  loading = signal(false);
  searchTerm = '';

  selectedCount = computed(() => this.filteredEmployees().filter(e => e.selected).length);
  allSelected = computed(() => this.filteredEmployees().length > 0 && this.filteredEmployees().every(e => e.selected));
  someSelected = computed(() => this.filteredEmployees().some(e => e.selected) && !this.allSelected());
  criticalCount = computed(() => this.filteredEmployees().filter(e => e.jobRole.riskScore >= 90).length);
  highCount = computed(() => this.filteredEmployees().filter(e => e.jobRole.riskScore >= 70 && e.jobRole.riskScore < 90).length);

  ngOnInit(): void { this.loadEmployees(); }

  loadEmployees(): void {
    this.loading.set(true);
    this.api.getHighRiskEmployees().subscribe({
      next: (data) => {
        const sorted = (Array.isArray(data) ? data : [])
          .sort((a, b) => b.jobRole.riskScore - a.jobRole.riskScore);
        const withSelected = sorted.map(emp => ({ ...emp, selected: true }));
        this.employees.set(withSelected);
        this.applyFilter();
        this.loading.set(false);
        this.toast.show(`Loaded ${sorted.length} high‑risk employees`, 'info');
      },
      error: () => {
        this.employees.set([]);
        this.filteredEmployees.set([]);
        this.loading.set(false);
        this.toast.show('Failed to load employees', 'error');
      },
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredEmployees.set(
      this.employees().filter(e =>
        e.name.toLowerCase().includes(term) || e.employeeId.toLowerCase().includes(term)
      )
    );
  }

  toggleAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.filteredEmployees.update(list => list.map(e => ({ ...e, selected: checked })));
    // Sync back to master list
    this.syncSelectionToMaster();
  }

  onCheckChange(): void {
    this.syncSelectionToMaster();
  }

  private syncSelectionToMaster(): void {
    const filtered = this.filteredEmployees();
    this.employees.update(master =>
      master.map(emp => {
        const match = filtered.find(f => f.id === emp.id);
        return match ? { ...emp, selected: match.selected } : emp;
      })
    );
  }

  proceedToPortfolio(): void {
    const selectedIds = this.filteredEmployees().filter(e => e.selected).map(e => e.employeeId);
    if (selectedIds.length === 0) {
      this.toast.show('No employees selected', 'error');
      return;
    }
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