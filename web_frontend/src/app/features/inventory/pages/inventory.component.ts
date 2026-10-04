import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Product, Branch, UserRole, InventoryItem, InventoryStatus } from '../../../core/models/shopchain.models';
import { BranchService } from '../../../core/services/branch.service';
import { AuthService } from '../../../core/services/auth.service';
import { forkJoin } from 'rxjs';
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
  imports: [FormsModule, ReactiveFormsModule],
  template: `<div class="page-head mock-head">
      <div>
        <div class="section-title">Inventario</div>
        <div class="section-subtitle">Consulta del stock por producto y sucursal.</div>
      </div>
      <button class="btn primary" (click)="refresh()">Actualizar inventario</button>
    </div>
    @if (auth.hasRole(roles.Admin, roles.Warehouse)) {
      <form class="card form-card" [formGroup]="form" (ngSubmit)="register()">
        <h2>Registrar producto en sucursal</h2>
        <p>El registro comienza con stock cero. Luego registra una entrada en Movimientos.</p>
        <div class="form-grid">
          <label>Producto<select formControlName="productId"><option [ngValue]="0">Selecciona</option>
            @for (p of products; track p.id) { @if (p.active) { <option [ngValue]="p.id">{{ p.name }}</option> } }
          </select></label>
          <label>Sucursal<select formControlName="branchId"><option [ngValue]="0">Selecciona</option>
            @for (b of branchList; track b.id) { @if (b.active) { <option [ngValue]="b.id">{{ b.name }}</option> } }
          </select></label>
          <label>Stock mínimo<input type="number" min="0" step="1" formControlName="minimumStock" /></label>
        </div>
        @if (form.touched && form.invalid) { <p class="error">Selecciona producto, sucursal y un stock mínimo válido.</p> }
        <button class="btn primary" type="submit">Registrar inventario</button>
      </form>
    }
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
            } @empty { <tr><td colspan="8">No hay inventario para los filtros seleccionados.</td></tr> }
          </tbody>
        </table>
      </div>
    </article>`,
})
export class InventoryComponent {
  auth = inject(AuthService);
  roles = UserRole;
  private branchService = inject(BranchService);
  form = inject(FormBuilder).nonNullable.group({
    productId: [0, Validators.min(1)],
    branchId: [0, Validators.min(1)],
    minimumStock: [3, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
  });
  private inventory = inject(InventoryService);
  private productsService = inject(ProductService);
  items: InventoryItem[] = [];
  products: Product[] = [];
  query = '';
  branch = '';
  status = '';
  branches: string[] = [];
  branchList: Branch[] = [];
  constructor() {
    this.refresh();
  }
  refresh(): void {
    forkJoin({ items: this.inventory.getInventory(), products: this.productsService.getProducts(), branches: this.branchService.getBranches() }).subscribe((data) => {
      this.items = data.items;
      this.products = data.products;
      this.branchList = data.branches;
      this.branches = data.branches.map((b) => b.name);
    });
  }
  register(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.inventory.register(this.form.getRawValue()).subscribe(() => this.refresh());
  }
  build(): InventoryRow[] {
    return this.products.map((product) => {
        const entries = this.items.filter((i) => i.productId === product.id);
        const stocks = Object.fromEntries(entries.map((i) => [i.branch, i.stock]));
        const selected = entries.filter((i) => !this.branch || i.branch === this.branch);
        const total = selected.reduce((s, i) => s + i.stock, 0);
        return {
          product,
          stocks,
          total,
          status:
            total === 0
              ? InventoryStatus.Out
              : selected.some((i) => i.status !== InventoryStatus.Available)
                ? InventoryStatus.Low
                : InventoryStatus.Available,
        };
      });
  }
  filtered(): InventoryRow[] {
    const q = this.query.toLowerCase();
    return this.build().filter(
      (r) =>
        (!q || `${r.product.name} ${r.product.sku}`.toLowerCase().includes(q)) &&
        (!this.branch || Object.hasOwn(r.stocks, this.branch)) &&
        (!this.status || r.status === this.status),
    );
  }
}
