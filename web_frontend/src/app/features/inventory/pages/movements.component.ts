import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/shopchain.models';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { BranchService } from '../../../core/services/branch.service';
import { InventoryService } from '../../../core/services/inventory.service';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';
import {
  Branch,
  Product,
  StockMovement,
  StockMovementType,
} from '../../../core/models/shopchain.models';
@Component({
  selector: 'app-movements',
  imports: [ReactiveFormsModule, FormsModule, DatePipe, StatusBadgePipe],
  template: `<div
      class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4"
    >
      <div>
        <h1 class="h3">Movimientos de stock</h1>
        <p class="text-body-secondary mb-0">Registro de entradas, salidas y reposiciones.</p>
      </div>
      @if (auth.hasRole(roles.Admin, roles.Warehouse)) {
        <button class="btn btn-primary" (click)="showForm.set(!showForm())">
          + Nuevo movimiento
        </button>
      }
    </div>
    @if (showForm()) {
      <form class="card shadow-sm p-4 mb-4" [formGroup]="form" (ngSubmit)="save()">
        <div class="d-flex justify-content-between align-items-center gap-2 mb-3">
          <h2 class="h5 mb-0">Registrar movimiento</h2>
          <button
            type="button"
            class="btn btn-outline-secondary btn-sm"
            (click)="showForm.set(false)"
          >
            Cerrar
          </button>
        </div>
        <div class="row g-3">
          <label class="col-12 col-md-6 form-label"
            >Producto<select class="form-select" formControlName="product">
              <option value="">Selecciona</option>
              @for (p of products(); track p.id) {
                @if (p.active) {
                  <option [value]="p.id">{{ p.name }}</option>
                }
              }
            </select></label
          ><label class="col-12 col-md-6 form-label"
            >Tipo<select class="form-select" formControlName="type">
              <option value="">Selecciona</option>
              <option value="ENTRADA">ENTRADA</option>
              <option value="SALIDA">SALIDA</option>
              <option value="REPOSICIÓN">REPOSICIÓN</option>
            </select></label
          ><label class="col-12 col-md-6 form-label"
            >Cantidad<input
              class="form-control"
              type="number"
              min="1"
              formControlName="quantity" /></label
          ><label class="col-12 col-md-6 form-label"
            >Sucursal<select class="form-select" formControlName="branch">
              <option value="">Selecciona</option>
              @for (b of branches(); track b.id) {
                @if (b.active) {
                  <option [value]="b.id">{{ b.name }}</option>
                }
              }
            </select></label
          ><label class="col-12 col-md-6 form-label"
            >Referencia<input
              class="form-control"
              formControlName="reference"
              placeholder="PED-0000 o REP-000" /></label
          ><label class="col-12 col-md-6 form-label"
            >Observación<input class="form-control" formControlName="observation"
          /></label>
        </div>
        @if (form.touched && form.invalid) {
          <small class="invalid-feedback d-block">Completa todos los campos requeridos.</small>
        }
        <div class="d-flex flex-wrap justify-content-end gap-2 mt-3">
          <button type="button" class="btn btn-outline-secondary" (click)="showForm.set(false)">
            Cancelar</button
          ><button class="btn btn-primary">Guardar movimiento</button>
        </div>
      </form>
    }
    <div class="card shadow-sm p-3 mb-4">
      <div class="row g-3">
        <div class="col-12 col-sm-6 col-lg-3">
          <select class="form-select" aria-label="Tipo de movimiento" [(ngModel)]="typeFilter">
            <option value="">Todos los tipos</option>
            <option>ENTRADA</option>
            <option>SALIDA</option>
            <option>REPOSICIÓN</option>
          </select>
        </div>
        <div class="col-12 col-sm-6 col-lg-3">
          <select class="form-select" aria-label="Sucursal" [(ngModel)]="branchFilter">
            <option value="">Todas las sucursales</option>
            @for (b of branches(); track b.id) {
              <option [value]="b.name">{{ b.name }}</option>
            }
          </select>
        </div>
        <div class="col-12 col-lg-6">
          <input
            class="form-control"
            aria-label="Buscar producto o referencia"
            [(ngModel)]="query"
            placeholder="Buscar producto o referencia"
          />
        </div>
      </div>
    </div>
    <article class="card shadow-sm p-4">
      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead class="table-light">
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
                  <span class="badge" [class]="m.type | statusBadge">{{ m.type }}</span>
                </td>
                <td [class.text-danger]="m.quantity < 0">
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
