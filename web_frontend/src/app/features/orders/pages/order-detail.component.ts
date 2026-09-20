import { Component, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, switchMap } from 'rxjs';
import { OrderService } from '../../../core/services/order.service';
import { OrderStatus } from '../../../core/models/shopchain.models';
@Component({
  selector: 'app-order-detail',
  imports: [AsyncPipe, CurrencyPipe, RouterLink],
  template: `@if (order$ | async; as o) {
    <div class="page-head mock-head">
      <div>
        <a class="back" routerLink="/orders">← Volver a pedidos</a>
        <div class="section-title">Seguimiento de pedido</div>
        <div class="section-subtitle">Pedido #{{ o.number }} · Retiro en {{ o.branch }}</div>
      </div>
      <span class="badge large" [attr.data-status]="o.status">{{ o.status }}</span>
    </div>
    <div class="tracking-layout">
      <article class="card">
        <h2>Estado del pedido</h2>
        <div class="vertical-timeline">
          @for (step of steps; track step.label; let i = $index) {
            <div [class.done]="isDone(o.status, i)">
              <span></span><strong>{{ step.label }}</strong
              ><small>{{ isDone(o.status, i) ? step.date : 'Pendiente' }}</small>
            </div>
          }
        </div>
      </article>
      <div>
        <article class="card">
          <h2>Detalle</h2>
          <table class="detail-table">
            <tbody>
              <tr>
                <th>Cliente</th>
                <td>{{ o.customer }}</td>
              </tr>
              <tr>
                <th>Documento</th>
                <td>{{ o.customerDocument }}</td>
              </tr>
              <tr>
                <th>Sucursal</th>
                <td>{{ o.branch }}</td>
              </tr>
              <tr>
                <th>Producto</th>
                <td>{{ o.items[0].product }} · Talla {{ o.items[0].size }}</td>
              </tr>
              <tr>
                <th>Cantidad</th>
                <td>{{ o.items[0].quantity }}</td>
              </tr>
              <tr>
                <th>Total</th>
                <td>{{ o.total | currency: 'PEN' : 'S/ ' }}</td>
              </tr>
            </tbody>
          </table>
        </article>
        <div class="info-alert">
          ⓘ El cliente será notificado cuando el pedido esté listo para retiro.
        </div>
      </div>
    </div>
  }`,
})
export class OrderDetailComponent {
  private orders = inject(OrderService);
  order$ = inject(ActivatedRoute).paramMap.pipe(
    map((p) => Number(p.get('id'))),
    switchMap((id) => this.orders.getOrderById(id)),
  );
  steps = [
    { label: 'Pedido registrado', date: '06/09/2026 · 10:20' },
    { label: 'Stock validado', date: '06/09/2026 · 10:21' },
    { label: 'En preparación', date: '06/09/2026 · 10:30' },
    { label: 'Listo para retiro', date: '' },
  ];
  isDone(status: OrderStatus, index: number): boolean {
    const levels: Record<string, number> = {
      [OrderStatus.Pending]: 0,
      [OrderStatus.Preparing]: 2,
      [OrderStatus.Ready]: 3,
      [OrderStatus.Completed]: 3,
      [OrderStatus.Cancelled]: -1,
    };
    return index <= levels[status];
  }
}
