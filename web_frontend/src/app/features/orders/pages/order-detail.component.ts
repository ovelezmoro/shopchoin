import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { Order, OrderStatus } from '../../../core/models/shopchain.models';

@Component({
  selector: 'app-order-detail',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  template: `@if (order(); as o) {
    <div class="page-head mock-head">
      <div><a class="back" routerLink="/orders">← Volver a pedidos</a>
        <div class="section-title">Seguimiento de pedido</div>
        <div class="section-subtitle">{{ o.number }} · {{ o.date | date: 'dd/MM/yyyy HH:mm' }}</div>
      </div>
      <span class="badge large" [attr.data-status]="o.status">{{ o.status }}</span>
    </div>
    <article class="card">
      <h2>Datos del pedido</h2>
      <p>Cliente: {{ o.customer }} · Documento: {{ o.customerDocument }}</p>
      <p>Sucursal: {{ o.branch }}</p>
      <p>{{ o.observations }}</p>
      <div class="table-wrap"><table>
        <thead><tr><th>Producto</th><th>Talla</th><th>Cantidad</th><th>Precio</th><th>Subtotal</th></tr></thead>
        <tbody>@for (item of o.items; track $index) {
          <tr><td>{{ item.product }}</td><td>{{ item.size ?? '—' }}</td><td>{{ item.quantity }}</td>
            <td>{{ item.price | currency: 'PEN' : 'S/ ' }}</td><td>{{ item.subtotal | currency: 'PEN' : 'S/ ' }}</td></tr>
        }</tbody>
      </table></div>
      <p><strong>Total: {{ o.total | currency: 'PEN' : 'S/ ' }}</strong></p>
      <div class="form-actions">
        @if (nextStatus(o.status); as next) {
          <button class="btn primary" (click)="changeStatus(next)">Pasar a {{ next }}</button>
        }
        @if (o.status !== statuses.Completed && o.status !== statuses.Cancelled) {
          <button class="btn secondary" (click)="changeStatus(statuses.Cancelled)">Cancelar pedido</button>
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
