import { Component, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { combineLatest, map, switchMap } from 'rxjs';
import { ProductService } from '../../../core/services/product.service';
import { InventoryService } from '../../../core/services/inventory.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/shopchain.models';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';
@Component({
  selector: 'app-product-detail',
  imports: [AsyncPipe, CurrencyPipe, RouterLink, StatusBadgePipe],
  template: `@if (vm$ | async; as vm) {
    @if (vm.product; as p) {
      <a class="d-inline-block mb-3" routerLink="/catalog">← Volver al catálogo</a>
      <div class="row g-4">
        <div class="col-12 col-lg-5">
          <div
            class="product-placeholder bg-secondary-subtle rounded d-flex align-items-center justify-content-center h-100"
          >
            <i class="bi bi-box-seam display-1 text-secondary" aria-hidden="true"></i>
          </div>
        </div>
        <div class="col-12 col-lg-7">
          <article class="card shadow-sm p-4">
            <span class="badge text-bg-info align-self-start mb-3">{{ p.category }}</span>
            <h1 class="h3">{{ p.name }}</h1>
            <p class="text-body-secondary">SKU: {{ p.sku }}</p>
            <strong class="fs-4 text-primary mb-3">{{ p.price | currency: 'PEN' : 'S/ ' }}</strong>
            <p class="text-body-secondary">{{ p.description }}</p>
            <hr />
            <h2 class="h5">Stock por sucursal</h2>
            <div class="table-responsive">
              <table class="table table-hover align-middle">
                <thead class="table-light">
                  <tr>
                    <th>Sucursal</th>
                    <th>Stock</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  @for (s of vm.stock; track s.branch) {
                    <tr>
                      <td>{{ s.branch }}</td>
                      <td>{{ s.stock }}</td>
                      <td>
                        <span class="badge" [class]="s.status | statusBadge">{{ s.status }}</span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            @if (p.active && auth.hasRole(roles.Admin, roles.Store)) {
              <a class="btn btn-primary" routerLink="/orders/new">Registrar pedido</a>
            }
          </article>
        </div>
      </div>
    }
  }`,
})
export class ProductDetailComponent {
  auth = inject(AuthService);
  roles = UserRole;
  private route = inject(ActivatedRoute);
  private products = inject(ProductService);
  private inventory = inject(InventoryService);
  vm$ = this.route.paramMap.pipe(
    map((p) => Number(p.get('id'))),
    switchMap((id) =>
      combineLatest({
        product: this.products.getProductById(id),
        stock: this.inventory.getStockByProduct(id),
      }),
    ),
  );
}
