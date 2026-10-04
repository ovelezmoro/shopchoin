import { Component, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
@Component({
  selector: 'app-administration',
  imports: [RouterLink, AsyncPipe, CurrencyPipe],
  template: `<div class="section-title">Administración</div>
    <div class="section-subtitle">Gestión de productos, sucursales y usuarios.</div>
    <nav class="admin-tabs">
      <a class="active" routerLink="/administration/products">Productos</a
      ><a routerLink="/administration/branches">Sucursales</a
      ><a routerLink="/administration/users">Usuarios</a>
    </nav>
    <div class="admin-grid mock-admin">
      <a class="admin-card" routerLink="/administration/products"
        ><span class="metric-icon">♢</span>
        <div>
          <h2>Productos</h2>
          <p>Gestiona productos, categorías, precios y estado.</p>
          <strong>Gestionar productos</strong>
        </div></a
      ><a class="admin-card" routerLink="/administration/branches"
        ><span class="metric-icon">⌂</span>
        <div>
          <h2>Sucursales</h2>
          <p>Administra las sucursales y sus datos de ubicación.</p>
          <strong>Gestionar sucursales</strong>
        </div></a
      ><a class="admin-card" routerLink="/administration/users"
        ><span class="metric-icon">◎</span>
        <div>
          <h2>Usuarios</h2>
          <p>Gestiona cuentas, roles y estado de acceso.</p>
          <strong>Gestionar usuarios</strong>
        </div></a
      >
    </div>
    <article class="card">
      <div class="card-head">
        <h2>Productos registrados</h2>
        <a class="btn primary small" routerLink="/administration/products">Nuevo producto</a>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (p of products$ | async; track p.id) {
              <tr>
                <td>{{ p.sku }}</td>
                <td>{{ p.name }}</td>
                <td>{{ p.category }}</td>
                <td>{{ p.price | currency: 'PEN' : 'S/ ' }}</td>
                <td><span class="badge success">Activo</span></td>
                <td><a class="action" routerLink="/administration/products">Editar</a></td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </article>`,
})
export class AdministrationComponent {
  products$ = inject(ProductService).getProducts();
}
