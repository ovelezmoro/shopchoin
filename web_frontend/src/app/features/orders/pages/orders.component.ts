import { Component, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Order, UserRole } from '../../../core/models/shopchain.models';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';
@Component({
  selector: 'app-orders',
  imports: [AsyncPipe, CurrencyPipe, DatePipe, FormsModule, RouterLink, StatusBadgePipe],
  template: `<div
      class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4"
    >
      <div>
        <p class="text-primary small fw-bold mb-1">VENTAS</p>
        <h1 class="h3">Pedidos</h1>
        <p class="text-body-secondary mb-0">
          Consulta y realiza seguimiento a los pedidos registrados.
        </p>
      </div>
      @if (auth.hasRole(roles.Admin, roles.Store)) {
        <a class="btn btn-primary" routerLink="/orders/new">+ Nuevo pedido</a>
      }
    </div>
    <article class="card shadow-sm p-4">
      <div class="row g-3 mb-3">
        <div class="col-12 col-md-8">
          <input
            class="form-control"
            aria-label="Buscar pedido o cliente"
            [(ngModel)]="query"
            placeholder="Buscar pedido o cliente"
          />
        </div>
        <div class="col-12 col-md-4">
          <select class="form-select" aria-label="Estado del pedido" [(ngModel)]="status">
            <option value="">Todos los estados</option>
            <option>Pendiente</option>
            <option>En preparación</option>
            <option>Listo para retiro</option>
            <option>Completado</option>
            <option>Cancelado</option>
          </select>
        </div>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead class="table-light">
            <tr>
              <th>Nro. pedido</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Sucursal de retiro</th>
              <th>Estado</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (o of filtered(orders$ | async); track o.id) {
              <tr>
                <td>
                  <strong>{{ o.number }}</strong>
                </td>
                <td>{{ o.date | date: 'dd/MM/yyyy HH:mm' }}</td>
                <td>{{ o.customer }}</td>
                <td>{{ o.branch }}</td>
                <td>
                  <span class="badge" [class]="o.status | statusBadge">{{ o.status }}</span>
                </td>
                <td>{{ o.total | currency: 'PEN' : 'S/ ' }}</td>
                <td>
                  <a class="btn btn-link btn-sm" [routerLink]="['/orders', o.id]"
                    >Ver seguimiento</a
                  >
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7">No hay pedidos para mostrar.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </article>`,
})
export class OrdersComponent {
  auth = inject(AuthService);
  roles = UserRole;
  query = '';
  status = '';
  orders$ = inject(OrderService).getOrders();
  filtered(orders: Order[] | null): Order[] {
    return (orders ?? []).filter(
      (o) =>
        (!this.status || o.status === this.status) &&
        `${o.number} ${o.customer}`.toLowerCase().includes(this.query.toLowerCase()),
    );
  }
}
