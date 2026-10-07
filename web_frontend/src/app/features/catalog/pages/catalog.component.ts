import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InventoryStatus, Product } from '../../../core/models/shopchain.models';
import { ProductService } from '../../../core/services/product.service';
import { InventoryService } from '../../../core/services/inventory.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/shopchain.models';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';
@Component({
  selector: 'app-catalog',
  imports: [FormsModule, CurrencyPipe, RouterLink, StatusBadgePipe],
  template: `<div
      class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4"
    >
      <div>
        <h1 class="h3">Catálogo de productos</h1>
        <p class="text-body-secondary mb-0">Consulta de productos y disponibilidad.</p>
      </div>
      @if (auth.hasRole(roles.Admin)) {
        <a class="btn btn-primary" routerLink="/administration/products">+ Nuevo producto</a>
      }
    </div>
    <div class="card shadow-sm p-3 mb-4">
      <div class="row g-3">
        <div class="col-12 col-lg-5">
          <input
            class="form-control"
            aria-label="Buscar por nombre o SKU"
            [(ngModel)]="query"
            placeholder="Buscar por nombre o SKU"
          />
        </div>
        <div class="col-12 col-sm-6 col-lg-3">
          <select class="form-select" aria-label="Categoría" [(ngModel)]="category">
            <option value="">Todas las categorías</option>
            @for (c of categories; track c) {
              <option>{{ c }}</option>
            }
          </select>
        </div>
        <div class="col-12 col-sm-6 col-lg-4">
          <select class="form-select" aria-label="Marca" [(ngModel)]="brand">
            <option value="">Todas las marcas</option>
            @for (b of brands; track b) {
              <option>{{ b }}</option>
            }
          </select>
        </div>
      </div>
    </div>
    <div class="row g-4">
      @for (p of filtered(); track p.id) {
        <div class="col-12 col-md-6 col-xl-4">
          <article class="card shadow-sm h-100 p-4">
            <div class="bg-body-tertiary text-body-secondary rounded p-3 fs-3 mb-3">
              <i class="bi bi-box-seam" aria-hidden="true"></i>
            </div>
            <h2 class="h5">{{ p.name }}</h2>
            <p class="text-body-secondary small">SKU: {{ p.sku }}</p>
            <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <strong>{{ p.price | currency: 'PEN' : 'S/ ' }}</strong
              ><span class="badge" [class]="status(p.id) | statusBadge">{{ status(p.id) }}</span>
            </div>
            <p>Stock total: {{ stock[p.id] || 0 }} unidades</p>
            <a class="btn btn-outline-primary w-100 mt-auto" [routerLink]="['/catalog', p.id]"
              >Ver detalle</a
            >
          </article>
        </div>
      } @empty {
        <div class="col-12">
          <div class="alert alert-info" role="status">No se encontraron productos.</div>
        </div>
      }
    </div>`,
})
export class CatalogComponent {
  auth = inject(AuthService);
  roles = UserRole;
  private service = inject(ProductService);
  query = '';
  category = '';
  brand = '';
  products = signal<Product[]>([]);
  stock: Record<number, number> = {};
  categories: string[] = [];
  brands: string[] = [];
  minimumStock: Record<number, number> = {};
  constructor() {
    this.service.getProducts().subscribe((p) => {
      this.products.set(p.filter((product) => product.active));
      this.brands = [...new Set(this.products().map((product) => product.brand))];
    });
    this.service
      .getCategories()
      .subscribe((c) => (this.categories = c.map((category) => category.name)));
    inject(InventoryService)
      .getInventory()
      .subscribe((items) =>
        items.forEach((i) => {
          this.stock[i.productId] = (this.stock[i.productId] || 0) + i.stock;
          this.minimumStock[i.productId] = (this.minimumStock[i.productId] || 0) + i.minimumStock;
        }),
      );
  }
  filtered(): Product[] {
    const q = this.query.toLowerCase();
    return this.products().filter(
      (p) =>
        (!q || `${p.name} ${p.sku}`.toLowerCase().includes(q)) &&
        (!this.category || p.category === this.category) &&
        (!this.brand || p.brand === this.brand),
    );
  }
  status(id: number): InventoryStatus {
    const total = this.stock[id] || 0;
    return total === 0
      ? InventoryStatus.Out
      : total <= (this.minimumStock[id] || 0)
        ? InventoryStatus.Low
        : InventoryStatus.Available;
  }
}
