import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { combineLatest, map } from 'rxjs';
import { DashboardService } from '../../../core/services/dashboard.service';
@Component({
  selector: 'app-home',
  imports: [AsyncPipe],
  template: `<div class="section-title">Panel principal</div>
    <div class="section-subtitle">Resumen general del inventario y los pedidos.</div>
    @if (vm$ | async; as vm) {
      <div class="metrics mock-metrics">
        @for (metric of vm.metrics; track metric.label) {
          <article class="metric-card">
            <div>
              <small>{{ metric.label }}</small
              ><strong>{{ metric.value }}</strong>
            </div>
            <span class="metric-icon">{{ icon(metric.icon) }}</span>
          </article>
        }
      </div>
      <div class="mock-dashboard">
        <article class="card chart-card">
          <h2>Stock por sucursal</h2>
          <div class="fake-chart">
            @for (item of vm.branches; track item.branch) {
              <div class="chart-column">
                <div class="bar" [style.height.%]="item.percentage"></div>
                <span>{{ item.branch }}</span>
              </div>
            }
          </div>
        </article>
        <article class="card activity-card">
          <h2>Actividad reciente</h2>
          @for (item of vm.activity; track item.title) {
            <div class="activity">
              <strong>{{ item.title }}</strong
              ><span>{{ item.detail }}</span>
            </div>
          }
        </article>
      </div>
    }`,
})
export class HomeComponent {
  private dashboard = inject(DashboardService);
  vm$ = combineLatest([
    this.dashboard.getMetrics(),
    this.dashboard.getBranchSummary(),
    this.dashboard.getRecentActivity(),
  ]).pipe(map(([metrics, branches, activity]) => ({ metrics, branches, activity })));
  icon(name: string): string {
    return ({ shoe: '♢', boxes: '▦', bag: '▣', alert: '⚠' } as Record<string, string>)[name] ?? '•';
  }
}
