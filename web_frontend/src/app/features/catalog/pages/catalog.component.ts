import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InventoryStatus, Product } from '../../../core/models/shopchain.models';
import { ProductService } from '../../../core/services/product.service';
import { InventoryService } from '../../../core/services/inventory.service';
@Component({
  selector: 'app-catalog',
  imports: [FormsModule, CurrencyPipe, RouterLink],
  template: `<div class="page-head mock-head">
      <div>
        <div class="section-title">Catálogo de productos</div>
        <div class="section-subtitle">Consulta de productos y disponibilidad.</div>
      </div>
      <a class="btn primary" routerLink="/administration/products">+ Nuevo producto</a>
    </div>
    <div class="card filter-card">
      <div class="filters four">
        <label class="search"
          ><input [(ngModel)]="query" placeholder="Buscar por nombre o SKU" /></label
        ><select [(ngModel)]="category">
          <option value="">Todas las categorías</option>
          @for (c of categories; track c) {
            <option>{{ c }}</option>
          }</select
        ><select [(ngModel)]="brand">
          <option value="">Todas las marcas</option>
          @for (b of brands; track b) {
            <option>{{ b }}</option>
          }</select
        ><button class="btn secondary">Filtrar</button>
      </div>
    </div>
    <div class="product-grid">
      @for (p of filtered(); track p.id) {
        <article class="product-card mock-product">
          <div class="product-thumb">♢</div>
          <h2>{{ p.name }}</h2>
          <p>SKU: {{ p.sku }}</p>
          <div class="product-meta">
            <strong>{{ p.price | currency: 'PEN' : 'S/ ' }}</strong
            ><span class="badge" [attr.data-status]="status(p.id)">{{ status(p.id) }}</span>
          </div>
          <p>Stock total: {{ stock[p.id] || 0 }} unidades</p>
          <a class="btn outline wide" [routerLink]="['/catalog', p.id]">Ver detalle</a>
        </article>
      } @empty {
        <div class="empty">No se encontraron productos.</div>
      }
    </div>`,
})
export class CatalogComponent {
  private service = inject(ProductService);
  query = '';
  category = '';
  brand = '';
  products = signal<Product[]>([]);
  stock: Record<number, number> = {};
  categories = ['Running'];
  brands = ['Nike', 'Adidas', 'Puma', 'New Balance', 'Asics'];
  constructor() {
    this.service.getProducts().subscribe((p) => this.products.set(p));
    inject(InventoryService)
      .getInventory()
      .subscribe((items) =>
        items.forEach((i) => (this.stock[i.productId] = (this.stock[i.productId] || 0) + i.stock)),
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
      : total <= 7
        ? InventoryStatus.Low
        : InventoryStatus.Available;
  }
}
