import { Component, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { combineLatest, map, switchMap } from 'rxjs';
import { ProductService } from '../../../core/services/product.service';
import { InventoryService } from '../../../core/services/inventory.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/shopchain.models';
@Component({
  selector: 'app-product-detail',
  imports: [AsyncPipe, CurrencyPipe, RouterLink],
  template: `@if (vm$ | async; as vm) {
    @if (vm.product; as p) {
      <a class="back muted-link" routerLink="/catalog">← Volver al catálogo</a>
      <div class="mock-detail">
        <div class="shoe-hero">♢</div>
        <article class="card product-info">
          <span class="badge info">{{ p.category }}</span>
          <h1>{{ p.name }}</h1>
          <p class="muted">SKU: {{ p.sku }}</p>
          <strong class="price text-primary">{{ p.price | currency: 'PEN' : 'S/ ' }}</strong>
          <p class="muted">{{ p.description }}</p>
          <hr />
          <h2>Stock por sucursal</h2>
          <div class="table-wrap">
            <table>
              <thead>
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
                      <span
                        class="badge"
                        [attr.data-status]="s.status"
                        >{{ s.status }}</span
                      >
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          @if (p.active && auth.hasRole(roles.Admin, roles.Store)) { <a class="btn primary" routerLink="/orders/new">Registrar pedido</a> }
        </article>
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
