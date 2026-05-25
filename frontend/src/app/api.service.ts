import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, timeout } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Employee {
  id: number;
  employeeId: string;
  name: string;
  jobRole: { title: string; riskScore: number; isHighRisk: boolean };
  cvText: string;
}

export interface PortfolioMatch {
  vacancy: {
    id: number;
    vacancyId: string;
    jobTitle: string;
    department: string;
    description: string;
    field: string;
  };
  matchPercent: number;
  matchingSkills: string[];
  missingSkills: string[];
}

export interface Portfolio {
  employeeName: string;
  currentJob: string;
  type: 'same-field' | 'cross-role';
  matches: PortfolioMatch[];
}

export interface UpskillingCourse {
  id: number;
  courseName: string;
  duration: string;
  skill: { name: string };
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = '/api';

  constructor(private http: HttpClient) {}

  private handleError(error: any) {
    console.error('API Error:', error);
    return throwError(() => error);
  }

  getHighRiskEmployees(): Observable<Employee[]> {
    const url = `${this.base}/employees/high-risk?_=${Date.now()}`;
    const headers = { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' };
    return this.http.get<Employee[]>(url, { headers }).pipe(
      timeout(10000), // ✅ 10 second timeout
      catchError(this.handleError)
    );
  }

  extractSkills(employeeId: string): Observable<{ extracted: string[] }> {
    const headers = { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' };
    return this.http.post<{ extracted: string[] }>(`${this.base}/employees/${employeeId}/extract-skills`, {}, { headers }).pipe(
      timeout(10000),
      catchError(this.handleError)
    );
  }

  getPortfolio(employeeId: string, threshold: number): Observable<Portfolio> {
    const url = `${this.base}/employees/${employeeId}/portfolio?threshold=${threshold}&_=${Date.now()}`;
    const headers = { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' };
    return this.http.get<Portfolio>(url, { headers }).pipe(
      timeout(10000),
      catchError(this.handleError)
    );
  }

  getCourseForSkill(skillName: string): Observable<UpskillingCourse | { message: string }> {
    const url = `${this.base}/upskilling/skill/${skillName}?_=${Date.now()}`;
    const headers = { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' };
    return this.http.get<UpskillingCourse | { message: string }>(url, { headers }).pipe(
      timeout(10000),
      catchError(this.handleError)
    );
  }
}