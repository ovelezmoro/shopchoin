import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { Order, OrderStatus } from '../../../core/models/shopchain.models';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';

@Component({
  selector: 'app-order-detail',
  imports: [CurrencyPipe, DatePipe, RouterLink, StatusBadgePipe],
  template: `@if (order(); as o) {
    <div
      class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4"
    >
      <div>
        <a class="d-inline-block mb-3" routerLink="/orders">← Volver a pedidos</a>
        <h1 class="h3">Seguimiento de pedido</h1>
        <p class="text-body-secondary mb-0">
          {{ o.number }} · {{ o.date | date: 'dd/MM/yyyy HH:mm' }}
        </p>
      </div>
      <span class="badge p-2 align-self-start" [class]="o.status | statusBadge">{{
        o.status
      }}</span>
    </div>
    <article class="card shadow-sm p-4">
      <h2 class="h5">Datos del pedido</h2>
      <p>Cliente: {{ o.customer }} · Documento: {{ o.customerDocument }}</p>
      <p>Sucursal: {{ o.branch }}</p>
      <p>{{ o.observations }}</p>
      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead class="table-light">
            <tr>
              <th>Producto</th>
              <th>Talla</th>
              <th>Cantidad</th>
              <th>Precio</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            @for (item of o.items; track $index) {
              <tr>
                <td>{{ item.product }}</td>
                <td>{{ item.size ?? '—' }}</td>
                <td>{{ item.quantity }}</td>
                <td>{{ item.price | currency: 'PEN' : 'S/ ' }}</td>
                <td>{{ item.subtotal | currency: 'PEN' : 'S/ ' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <p>
        <strong>Total: {{ o.total | currency: 'PEN' : 'S/ ' }}</strong>
      </p>
      <div class="d-flex flex-wrap justify-content-end gap-2 mt-3">
        @if (nextStatus(o.status); as next) {
          <button class="btn btn-primary" (click)="changeStatus(next)">Pasar a {{ next }}</button>
        }
        @if (o.status !== statuses.Completed && o.status !== statuses.Cancelled) {
          <button class="btn btn-outline-danger" (click)="changeStatus(statuses.Cancelled)">
            Cancelar pedido
          </button>
        }
      </div>
    </article>
  }`,
})
export class OrderDetailComponent {
  private service = inject(OrderService);
  order = signal<Order | null>(null);
  statuses = OrderStatus;
  constructor() {
    const id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));
    this.service.getOrderById(id).subscribe((o) => this.order.set(o));
  }
  nextStatus(status: OrderStatus): OrderStatus | null {
    if (status === OrderStatus.Pending) return OrderStatus.Preparing;
    if (status === OrderStatus.Preparing) return OrderStatus.Ready;
    if (status === OrderStatus.Ready) return OrderStatus.Completed;
    return null;
  }
  changeStatus(status: OrderStatus): void {
    const order = this.order();
    if (order) this.service.updateStatus(order.id, status).subscribe((o) => this.order.set(o));
  }
}
