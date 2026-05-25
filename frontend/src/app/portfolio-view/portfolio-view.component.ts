import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, NgClass } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiService, Portfolio, UpskillingCourse } from '../api.service';

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
  imports: [FormsModule, DecimalPipe, NgClass],
  templateUrl: './portfolio-view.component.html',
  styleUrls: ['./portfolio-view.component.css'],
})
export class PortfolioViewComponent implements OnInit {
  entries = signal<EmployeePortfolio[]>([]);

  // Track which match cards are expanded: key = `${employeeId}:${matchIndex}`
  expandedMatches = signal<Set<string>>(new Set());

  // SVG ring constants
  readonly circumference = 2 * Math.PI * 18; // r=18

  // Summary computed
  anyLoading    = computed(() => this.entries().some(e => e.loading));
  matchedCount  = computed(() => this.entries().filter(e => (e.portfolio?.matches.length ?? 0) > 0).length);
  noMatchCount  = computed(() => this.entries().filter(e => e.portfolio && e.portfolio.matches.length === 0).length);
  sameFieldCount= computed(() => this.entries().filter(e => e.portfolio?.type === 'same-field').length);
  crossRoleCount= computed(() => this.entries().filter(e => e.portfolio?.type === 'cross-role').length);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
  ) {}

  ngOnInit(): void {
    const ids = (this.route.snapshot.queryParamMap.get('ids') || '')
      .split(',').filter(Boolean);

    this.entries.set(ids.map(id => ({
      employeeId: id,
      portfolio: null,
      loading: true,
      error: null,
      threshold: 60,
      courseCache: new Map(),
    })));

    // Extract skills for all employees in parallel, then load portfolios
    if (ids.length === 0) return;

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
        this.prefetchCourses(employeeId, data);
        // Auto-expand first match
        if (data.matches.length > 0) {
          this.expandedMatches.update(s => {
            const next = new Set(s);
            next.add(`${employeeId}:0`);
            return next;
          });
        }
      },
      error: (err) => {
        console.error(`Portfolio load failed for ${employeeId}`, err);
        this.updateEntry(employeeId, { loading: false, error: 'Failed to load portfolio. The employee may have no skills extracted yet.' });
      },
    });
  }

  onThresholdChange(employeeId: string, value: number): void {
    this.updateEntry(employeeId, { threshold: Number(value) });
    this.loadPortfolio(employeeId);
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

  getCourse(entry: EmployeePortfolio, skill: string): UpskillingCourse | null | undefined {
    return entry.courseCache.get(skill);
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

  private prefetchCourses(employeeId: string, data: Portfolio): void {
    for (const match of data.matches) {
      for (const skill of match.missingSkills) {
        const entry = this.entries().find(e => e.employeeId === employeeId);
        if (!entry || entry.courseCache.has(skill)) continue;

        // Mark as in-flight
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
