import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BranchSummary, DashboardMetric, RecentActivity } from '../models/shopchain.models';
import { BRANCH_SUMMARY, DASHBOARD_METRICS, RECENT_ACTIVITY } from '../data/mock-data';
@Injectable({ providedIn: 'root' })
export class DashboardService {
  getMetrics(): Observable<DashboardMetric[]> {
    return of(DASHBOARD_METRICS);
  }
  getBranchSummary(): Observable<BranchSummary[]> {
    return of(BRANCH_SUMMARY);
  }
  getRecentActivity(): Observable<RecentActivity[]> {
    return of(RECENT_ACTIVITY);
  }
}
