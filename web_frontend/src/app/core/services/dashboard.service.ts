import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BranchSummary, DashboardMetric, RecentActivity } from '../models/shopchain.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/dashboard`;
  getMetrics() { return this.http.get<DashboardMetric[]>(`${this.url}/metrics`); }
  getBranchSummary() { return this.http.get<BranchSummary[]>(`${this.url}/branches`); }
  getRecentActivity() { return this.http.get<RecentActivity[]>(`${this.url}/activity`); }
}
