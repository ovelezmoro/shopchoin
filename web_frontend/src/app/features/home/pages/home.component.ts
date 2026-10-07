import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { combineLatest, map } from 'rxjs';
import { DashboardService } from '../../../core/services/dashboard.service';
@Component({
  selector: 'app-home',
  imports: [AsyncPipe],
  template: `<h1 class="h3">Panel principal</h1>
    <p class="text-body-secondary mb-4">Resumen general del inventario y los pedidos.</p>
    @if (vm$ | async; as vm) {
      <div class="row g-3 mb-4">
        @for (metric of vm.metrics; track metric.label) {
          <div class="col-12 col-sm-6 col-xl-3">
            <article
              class="card shadow-sm h-100 p-3 flex-row justify-content-between align-items-start gap-2"
            >
              <div>
                <small class="text-body-secondary">{{ metric.label }}</small
                ><strong class="d-block fs-3 mt-2">{{ metric.value }}</strong>
              </div>
              <i
                class="bi fs-3 text-primary bg-primary-subtle rounded p-2"
                [class]="icon(metric.icon)"
                aria-hidden="true"
              ></i>
            </article>
          </div>
        }
      </div>
      <div class="row g-4">
        <div class="col-12 col-lg-8">
          <article class="card shadow-sm p-4 h-100">
            <h2 class="h5 mb-3">Stock por sucursal</h2>
            <div class="d-grid gap-3">
              @for (item of vm.branches; track item.branch) {
                <div>
                  <span class="d-block small mb-1">{{ item.branch }}</span>
                  <div
                    class="progress"
                    role="progressbar"
                    [attr.aria-label]="item.branch"
                    [attr.aria-valuenow]="item.percentage"
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    <div class="progress-bar" [style.width.%]="item.percentage"></div>
                  </div>
                </div>
              }
            </div>
          </article>
        </div>
        <div class="col-12 col-lg-4">
          <article class="card shadow-sm p-4 h-100">
            <h2 class="h5 mb-3">Actividad reciente</h2>
            <div class="list-group list-group-flush">
              @for (item of vm.activity; track item.title) {
                <div class="list-group-item px-0">
                  <strong>{{ item.title }}</strong
                  ><span class="d-block small text-body-secondary">{{ item.detail }}</span>
                </div>
              }
            </div>
          </article>
        </div>
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
    return (
      (
        {
          shoe: 'bi-box-seam',
          boxes: 'bi-boxes',
          bag: 'bi-bag',
          alert: 'bi-exclamation-triangle',
        } as Record<string, string>
      )[name] ?? 'bi-info-circle'
    );
  }
}
