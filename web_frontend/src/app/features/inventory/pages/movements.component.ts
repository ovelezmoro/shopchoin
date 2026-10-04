import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/shopchain.models';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { BranchService } from '../../../core/services/branch.service';
import { InventoryService } from '../../../core/services/inventory.service';
import {
  Branch,
  Product,
  StockMovement,
  StockMovementType,
} from '../../../core/models/shopchain.models';
@Component({
  selector: 'app-movements',
  imports: [ReactiveFormsModule, FormsModule, DatePipe],
  template: `<div class="page-head mock-head">
      <div>
        <div class="section-title">Movimientos de stock</div>
        <div class="section-subtitle">Registro de entradas, salidas y reposiciones.</div>
      </div>
      @if (auth.hasRole(roles.Admin, roles.Warehouse)) { <button class="btn primary" (click)="showForm.set(!showForm())">+ Nuevo movimiento</button> }
    </div>
    @if (showForm()) {
      <form class="card form-card" [formGroup]="form" (ngSubmit)="save()">
        <div class="card-head">
          <h2>Registrar movimiento</h2>
          <button type="button" class="link-btn" (click)="showForm.set(false)">Cerrar</button>
        </div>
        <div class="form-grid">
          <label
            >Producto<select formControlName="product">
              <option value="">Selecciona</option>
              @for (p of products(); track p.id) {
                @if (p.active) { <option [value]="p.id">{{ p.name }}</option> }
              }
            </select></label
          ><label
            >Tipo<select formControlName="type">
              <option value="">Selecciona</option>
              <option value="ENTRADA">ENTRADA</option>
              <option value="SALIDA">SALIDA</option>
              <option value="REPOSICIÓN">REPOSICIÓN</option>
            </select></label
          ><label>Cantidad<input type="number" min="1" formControlName="quantity" /></label
          ><label
            >Sucursal<select formControlName="branch">
              <option value="">Selecciona</option>
              @for (b of branches(); track b.id) {
                @if (b.active) { <option [value]="b.id">{{ b.name }}</option> }
              }
            </select></label
          ><label
            >Referencia<input formControlName="reference" placeholder="PED-0000 o REP-000" /></label
          ><label>Observación<input formControlName="observation" /></label>
        </div>
        @if (form.touched && form.invalid) {
          <small class="error">Completa todos los campos requeridos.</small>
        }
        <div class="form-actions">
          <button type="button" class="btn secondary" (click)="showForm.set(false)">Cancelar</button
          ><button class="btn primary">Guardar movimiento</button>
        </div>
      </form>
    }
    <div class="card filter-card">
      <div class="filters four">
        <select [(ngModel)]="typeFilter">
          <option value="">Todos los tipos</option>
          <option>ENTRADA</option>
          <option>SALIDA</option>
          <option>REPOSICIÓN</option></select
        ><select [(ngModel)]="branchFilter">
          <option value="">Todas las sucursales</option>
          @for (b of branches(); track b.id) {
            <option [value]="b.name">{{ b.name }}</option>
          }</select
        ><label class="search"
          ><input [(ngModel)]="query" placeholder="Buscar producto o referencia" /></label
        ><button class="btn secondary">Filtrar</button>
      </div>
    </div>
    <article class="card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Producto</th>
              <th>Tipo</th>
              <th>Cantidad</th>
              <th>Sucursal</th>
              <th>Referencia</th>
              <th>Responsable</th>
            </tr>
          </thead>
          <tbody>
            @for (m of filtered(); track m.id) {
              <tr>
                <td>{{ m.date | date: 'dd/MM/yyyy HH:mm' }}</td>
                <td>{{ m.product }}</td>
                <td>
                  <span class="badge movement" [attr.data-type]="m.type">{{ m.type }}</span>
                </td>
                <td [class.negative]="m.quantity < 0">
                  {{ m.quantity > 0 ? '+' : '' }}{{ m.quantity }}
                </td>
                <td>{{ m.branch }}</td>
                <td>{{ m.reference }}</td>
                <td>{{ m.responsible }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </article>`,
})
export class MovementsComponent {
  auth = inject(AuthService);
  roles = UserRole;
  private fb = inject(FormBuilder);
  private service = inject(InventoryService);
  showForm = signal(false);
  movements = signal<StockMovement[]>([]);
  products = signal<Product[]>([]);
  branches = signal<Branch[]>([]);
  typeFilter = '';
  branchFilter = '';
  query = '';
  form = this.fb.nonNullable.group({
    product: ['', Validators.required],
    type: ['', Validators.required],
    quantity: [1, [Validators.required, Validators.min(1)]],
    branch: ['', Validators.required],
    reference: ['', Validators.required],
    observation: [''],
  });
  constructor() {
    this.service.getMovements().subscribe((v) => this.movements.set(v));
    inject(ProductService)
      .getProducts()
      .subscribe((v) => this.products.set(v));
    inject(BranchService)
      .getBranches()
      .subscribe((v) => this.branches.set(v));
  }
  filtered(): StockMovement[] {
    const q = this.query.toLowerCase();
    return this.movements().filter(
      (m) =>
        (!this.typeFilter || m.type === this.typeFilter) &&
        (!this.branchFilter || m.branch === this.branchFilter) &&
        (!q || `${m.product} ${m.reference}`.toLowerCase().includes(q)),
    );
  }
  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const movement = {
      productId: Number(v.product),
      type: v.type as StockMovementType,
      quantity: v.quantity,
      branchId: Number(v.branch),
      reference: v.reference,
      observation: v.observation,
    };
    this.service.addMovement(movement).subscribe((saved) => {
      this.movements.update((list) => [saved, ...list]);
      this.showForm.set(false);
    });
  }
}
