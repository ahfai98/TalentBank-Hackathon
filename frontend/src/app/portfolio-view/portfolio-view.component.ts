import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, NgClass } from '@angular/common';
import { forkJoin, of, Subject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { ApiService, Portfolio, UpskillingCourse } from '../api.service';
import { ToastService } from '../ui/toast.service';
import { PortfolioStateService } from '../portfolio-state.service';

export interface EmployeePortfolio {
  employeeId: string;
  portfolio: Portfolio | null;
  loading: boolean;
  error: string | null;
  threshold: number;
  courseCache: Map<string, UpskillingCourse | null | undefined>;
}

@Component({
  selector: 'app-portfolio-view',
  standalone: true,
  imports: [FormsModule, DecimalPipe, NgClass, RouterLink],
  templateUrl: './portfolio-view.component.html',
  styleUrls: ['./portfolio-view.component.css'],
})
export class PortfolioViewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private portfolioState = inject(PortfolioStateService);

  entries = signal<EmployeePortfolio[]>([]);
  expandedMatches = signal<Set<string>>(new Set());
  collapsedCards = signal<Set<string>>(new Set());   // tracks which employee cards are collapsed
  readonly circumference = 2 * Math.PI * 18;

  private thresholdSubject = new Subject<{ id: string; value: number }>();

  anyLoading = computed(() => this.entries().some(e => e.loading));
  matchedCount = computed(() => this.entries().filter(e => (e.portfolio?.matches.length ?? 0) > 0).length);
  noMatchCount = computed(() => this.entries().filter(e => e.portfolio && e.portfolio.matches.length === 0).length);
  sameFieldCount = computed(() => this.entries().filter(e => e.portfolio?.type === 'same-field').length);
  crossRoleCount = computed(() => this.entries().filter(e => e.portfolio?.type === 'cross-role').length);

  constructor() {
    this.thresholdSubject.pipe(debounceTime(300)).subscribe(({ id, value }) => {
      this.updateEntry(id, { threshold: value });
      this.loadPortfolio(id);
    });
  }

  ngOnInit(): void {
    const ids = (this.route.snapshot.queryParamMap.get('ids') || '')
      .split(',').filter(Boolean);
    if (ids.length === 0) {
      this.router.navigate(['/employees']);
      return;
    }

    this.entries.set(ids.map(id => ({
      employeeId: id,
      portfolio: null,
      loading: true,
      error: null,
      threshold: 60,
      courseCache: new Map(),
    })));

    forkJoin(ids.map(id =>
      this.api.extractSkills(id).pipe(switchMap(() => of(id)))
    )).subscribe({
      next: () => ids.forEach(id => this.loadPortfolio(id)),
      error: () => ids.forEach(id => this.loadPortfolio(id)),
    });
  }

  loadPortfolio(employeeId: string): void {
    const entry = this.entries().find(e => e.employeeId === employeeId);
    if (!entry) return;

    this.updateEntry(employeeId, { loading: true, error: null });

    this.api.getPortfolio(employeeId, entry.threshold).subscribe({
      next: (data) => {
        this.updateEntry(employeeId, { portfolio: data, loading: false });
        this.portfolioState.savePortfolio(employeeId, data);
        this.prefetchCourses(employeeId, data);
        if (data.matches.length > 0) {
          this.expandedMatches.update(s => new Set(s).add(`${employeeId}:0`));
        }
      },
      error: () => {
        this.updateEntry(employeeId, { loading: false, error: 'Failed to load portfolio. Try again.' });
        this.toast.show(`Portfolio failed for ${employeeId}`, 'error');
      },
    });
  }

  onThresholdChange(employeeId: string, value: number): void {
    this.thresholdSubject.next({ id: employeeId, value });
  }

  toggleMatch(employeeId: string, index: number): void {
    const key = `${employeeId}:${index}`;
    this.expandedMatches.update(s => {
      const next = new Set(s);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  isExpanded(employeeId: string, index: number): boolean {
    return this.expandedMatches().has(`${employeeId}:${index}`);
  }

  // Collapse / expand entire employee card
  toggleCardCollapse(employeeId: string): void {
    this.collapsedCards.update(s => {
      const next = new Set(s);
      next.has(employeeId) ? next.delete(employeeId) : next.add(employeeId);
      return next;
    });
  }

  isCardCollapsed(employeeId: string): boolean {
    return this.collapsedCards().has(employeeId);
  }

  getCourse(entry: EmployeePortfolio, skill: string): UpskillingCourse | null | undefined {
    return entry.courseCache.get(skill);
  }

  getCardColor(index: number): string {
    const colors = ['#ff3b5c', '#f5a623', '#4d9fff', '#00d68f', '#a855f7', '#ec489a'];
    return colors[index % colors.length];
  }

  initials(entry: EmployeePortfolio): string {
    const name = entry.portfolio?.employeeName ?? entry.employeeId;
    return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
  }

  ringColor(pct: number): string {
    if (pct >= 75) return 'var(--green)';
    if (pct >= 50) return 'var(--amber)';
    return 'var(--red)';
  }

  ringOffset(pct: number): number {
    return this.circumference * (1 - pct / 100);
  }

  matchPillClass(pct: number): string {
    if (pct >= 75) return 'pill-match';
    if (pct >= 50) return 'pill-neutral';
    return 'pill-missing';
  }

  matchPillLabel(pct: number): string {
    if (pct >= 75) return 'Strong fit';
    if (pct >= 50) return 'Moderate fit';
    return 'Needs upskilling';
  }

  goBack(): void {
    this.router.navigate(['/employees']);
  }

  openHRModal(entry: EmployeePortfolio): void {
    const name = entry.portfolio?.employeeName ?? entry.employeeId;
    const decision = confirm(`Simulate HR decision for ${name}?\n"OK" = Approve redeployment\n"Cancel" = Reject (log skill gaps for upskilling)`);
    if (decision) {
      this.toast.show(`✅ Redeployment approved for ${name}.`, 'success');
    } else {
      this.toast.show(`📝 Rejected. Skill gaps recorded for future upskilling programmes.`, 'info');
    }
  }

  openCourseModal(course: UpskillingCourse): void {
    alert(`📘 ${course.courseName}\n⏱️ Duration: ${course.duration}\n🔗 (Mock) Enrolment link would be here.`);
  }

  private prefetchCourses(employeeId: string, data: Portfolio): void {
    for (const match of data.matches) {
      for (const skill of match.missingSkills) {
        const entry = this.entries().find(e => e.employeeId === employeeId);
        if (!entry || entry.courseCache.has(skill)) continue;
        const preFlight = new Map(entry.courseCache);
        preFlight.set(skill, undefined);
        this.updateEntry(employeeId, { courseCache: preFlight });

        this.api.getCourseForSkill(skill).subscribe({
          next: (res) => {
            const cache = new Map(this.entries().find(e => e.employeeId === employeeId)?.courseCache);
            cache.set(skill, 'id' in res ? (res as UpskillingCourse) : null);
            this.updateEntry(employeeId, { courseCache: cache });
          },
          error: () => {
            const cache = new Map(this.entries().find(e => e.employeeId === employeeId)?.courseCache);
            cache.set(skill, null);
            this.updateEntry(employeeId, { courseCache: cache });
          },
        });
      }
    }
  }

  private updateEntry(employeeId: string, patch: Partial<EmployeePortfolio>): void {
    this.entries.update(list =>
      list.map(e => e.employeeId === employeeId ? { ...e, ...patch } : e)
    );
  }
}