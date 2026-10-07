import { Component, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
@Component({
  selector: 'app-administration',
  imports: [RouterLink, AsyncPipe, CurrencyPipe],
  template: `<h1 class="h3">Administración</h1>
    <p class="text-body-secondary mb-4">Gestión de productos, sucursales y usuarios.</p>
    <nav class="nav nav-pills gap-2 mb-4" aria-label="Administración">
      <a class="nav-link" routerLink="/administration/products">Productos</a
      ><a class="nav-link" routerLink="/administration/branches">Sucursales</a
      ><a class="nav-link" routerLink="/administration/users">Usuarios</a>
    </nav>
    <div class="row g-4 mb-4">
      <div class="col-12 col-lg-4">
        <a
          class="card shadow-sm p-4 h-100 text-decoration-none text-body"
          routerLink="/administration/products"
          ><i class="bi bi-box-seam fs-2 text-primary mb-3" aria-hidden="true"></i>
          <div>
            <h2 class="h5">Productos</h2>
            <p>Gestiona productos, categorías, precios y estado.</p>
            <strong class="text-primary">Gestionar productos →</strong>
          </div></a
        >
      </div>
      <div class="col-12 col-lg-4">
        <a
          class="card shadow-sm p-4 h-100 text-decoration-none text-body"
          routerLink="/administration/branches"
          ><i class="bi bi-shop fs-2 text-primary mb-3" aria-hidden="true"></i>
          <div>
            <h2 class="h5">Sucursales</h2>
            <p>Administra las sucursales y sus datos de ubicación.</p>
            <strong class="text-primary">Gestionar sucursales →</strong>
          </div></a
        >
      </div>
      <div class="col-12 col-lg-4">
        <a
          class="card shadow-sm p-4 h-100 text-decoration-none text-body"
          routerLink="/administration/users"
          ><i class="bi bi-people fs-2 text-primary mb-3" aria-hidden="true"></i>
          <div>
            <h2 class="h5">Usuarios</h2>
            <p>Gestiona cuentas, roles y estado de acceso.</p>
            <strong class="text-primary">Gestionar usuarios →</strong>
          </div></a
        >
      </div>
    </div>
    <article class="card shadow-sm p-4">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h2 class="h5 mb-0">Productos registrados</h2>
        <a class="btn btn-primary btn-sm" routerLink="/administration/products">Nuevo producto</a>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead class="table-light">
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
                <td>
                  <span
                    class="badge"
                    [class.text-bg-success]="p.active"
                    [class.text-bg-secondary]="!p.active"
                    >{{ p.active ? 'Activo' : 'Inactivo' }}</span
                  >
                </td>
                <td>
                  <a class="btn btn-link btn-sm" routerLink="/administration/products">Editar</a>
                </td>
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
