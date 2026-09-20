import { Component, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
@Component({
  selector: 'app-orders',
  imports: [AsyncPipe, CurrencyPipe, RouterLink],
  template: `<div class="page-head">
      <div>
        <p class="eyebrow">VENTAS</p>
        <h1>Pedidos</h1>
        <p>Consulta y realiza seguimiento a los pedidos registrados.</p>
      </div>
      <a class="btn primary" routerLink="/orders/new">+ Nuevo pedido</a>
    </div>
    <article class="card">
      <div class="filters">
        <label class="search">⌕<input placeholder="Buscar pedido o cliente" /></label
        ><select>
          <option>Todos los estados</option>
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
            @for (o of orders$ | async; track o.id) {
              <tr>
                <td>
                  <strong>{{ o.number }}</strong>
                </td>
                <td>{{ o.date }}</td>
                <td>{{ o.customer }}</td>
                <td>{{ o.branch }}</td>
                <td>
                  <span class="badge" [attr.data-status]="o.status">{{ o.status }}</span>
                </td>
                <td>{{ o.total | currency: 'PEN' : 'S/ ' }}</td>
                <td><a class="action" [routerLink]="['/orders', o.id]">Ver seguimiento</a></td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </article>`,
})
export class OrdersComponent {
  orders$ = inject(OrderService).getOrders();
}
