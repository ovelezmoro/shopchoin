import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Product, InventoryItem, InventoryStatus } from '../../../core/models/shopchain.models';
import { InventoryService } from '../../../core/services/inventory.service';
import { ProductService } from '../../../core/services/product.service';
interface InventoryRow {
  product: Product;
  stocks: Record<string, number>;
  total: number;
  status: InventoryStatus;
}
@Component({
  selector: 'app-inventory',
  imports: [FormsModule],
  template: `<div class="page-head mock-head">
      <div>
        <div class="section-title">Inventario</div>
        <div class="section-subtitle">Consulta del stock por producto y sucursal.</div>
      </div>
      <button class="btn primary" (click)="refresh()">Actualizar inventario</button>
    </div>
    <div class="card filter-card">
      <div class="filters four">
        <label class="search"
          ><input [(ngModel)]="query" placeholder="Buscar producto o SKU" /></label
        ><select [(ngModel)]="branch">
          <option value="">Todas las sucursales</option>
          @for (b of branches; track b) {
            <option>{{ b }}</option>
          }</select
        ><select [(ngModel)]="status">
          <option value="">Todos los estados</option>
          <option>Disponible</option>
          <option>Stock bajo</option>
          <option>Sin stock</option></select
        ><button class="btn secondary">Consultar</button>
      </div>
    </div>
    <article class="card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>SKU</th>
              @for (b of branches; track b) {
                @if (!branch || branch === b) {
                  <th>{{ b }}</th>
                }
              }
              <th>Total</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            @for (row of filtered(); track row.product.id) {
              <tr>
                <td>{{ row.product.name }}</td>
                <td>{{ row.product.sku }}</td>
                @for (b of branches; track b) {
                  @if (!branch || branch === b) {
                    <td [class.highlight-cell]="branch === b">{{ row.stocks[b] || 0 }}</td>
                  }
                }
                <td>
                  <strong>{{ row.total }}</strong>
                </td>
                <td>
                  <span class="badge" [attr.data-status]="row.status">{{ row.status }}</span>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </article>`,
})
export class InventoryComponent {
  private inventory = inject(InventoryService);
  private productsService = inject(ProductService);
  items: InventoryItem[] = [];
  products: Product[] = [];
  rows = signal<InventoryRow[]>([]);
  query = '';
  branch = '';
  status = '';
  branches = ['San Miguel', 'San Isidro', 'Breña', 'Bellavista'];
  constructor() {
    this.refresh();
  }
  refresh(): void {
    this.inventory.getInventory().subscribe((items) => {
      this.items = items;
      this.build();
    });
    this.productsService.getProducts().subscribe((products) => {
      this.products = products;
      this.build();
    });
  }
  build(): void {
    if (!this.items.length || !this.products.length) return;
    this.rows.set(
      this.products.map((product) => {
        const entries = this.items.filter((i) => i.productId === product.id);
        const stocks = Object.fromEntries(entries.map((i) => [i.branch, i.stock]));
        const total = entries.reduce((s, i) => s + i.stock, 0);
        return {
          product,
          stocks,
          total,
          status:
            total === 0
              ? InventoryStatus.Out
              : total <= 7
                ? InventoryStatus.Low
                : InventoryStatus.Available,
        };
      }),
    );
  }
  filtered(): InventoryRow[] {
    const q = this.query.toLowerCase();
    return this.rows().filter(
      (r) =>
        (!q || `${r.product.name} ${r.product.sku}`.toLowerCase().includes(q)) &&
        (!this.branch || Object.hasOwn(r.stocks, this.branch)) &&
        (!this.status || r.status === this.status),
    );
  }
}
