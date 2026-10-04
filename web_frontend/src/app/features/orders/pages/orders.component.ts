import { Component, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Order, UserRole } from '../../../core/models/shopchain.models';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
@Component({
  selector: 'app-orders',
  imports: [AsyncPipe, CurrencyPipe, DatePipe, FormsModule, RouterLink],
  template: `<div class="page-head">
      <div>
        <p class="eyebrow">VENTAS</p>
        <h1>Pedidos</h1>
        <p>Consulta y realiza seguimiento a los pedidos registrados.</p>
      </div>
      @if (auth.hasRole(roles.Admin, roles.Store)) { <a class="btn primary" routerLink="/orders/new">+ Nuevo pedido</a> }
    </div>
    <article class="card">
      <div class="filters">
         <label class="search">⌕<input [(ngModel)]="query" placeholder="Buscar pedido o cliente" /></label
         ><select [(ngModel)]="status">
           <option value="">Todos los estados</option>
          <option>Pendiente</option>
          <option>En preparación</option>
          <option>Listo para retiro</option>
          <option>Completado</option>
          <option>Cancelado</option>
        </select>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
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
                  <span class="badge" [attr.data-status]="o.status">{{ o.status }}</span>
                </td>
                <td>{{ o.total | currency: 'PEN' : 'S/ ' }}</td>
                <td><a class="action" [routerLink]="['/orders', o.id]">Ver seguimiento</a></td>
              </tr>
            } @empty { <tr><td colspan="7">No hay pedidos para mostrar.</td></tr> }
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
    return (orders ?? []).filter((o) => (!this.status || o.status === this.status) &&
      `${o.number} ${o.customer}`.toLowerCase().includes(this.query.toLowerCase()));
  }
}
