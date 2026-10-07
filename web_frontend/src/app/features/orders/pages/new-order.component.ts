import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Branch, Product } from '../../../core/models/shopchain.models';
import { ProductService } from '../../../core/services/product.service';
import { BranchService } from '../../../core/services/branch.service';
import { OrderService } from '../../../core/services/order.service';
interface DraftItem {
  productId: number;
  quantity: number;
  size: number;
}
@Component({
  selector: 'app-new-order',
  imports: [ReactiveFormsModule, CurrencyPipe, RouterLink],
  template: `<h1 class="h3">Nuevo pedido</h1>
    <p class="text-body-secondary mb-4">Registro de un pedido con retiro en tienda.</p>
    <form [formGroup]="form" (ngSubmit)="submit()">
      <div class="row g-4">
        <div class="col-12 col-xl-8">
          <article class="card shadow-sm p-4">
            <h2 class="h5 mb-3">Datos del pedido</h2>
            <div class="row g-3 mb-3">
              <label class="col-12 col-md-6 form-label"
                >Cliente<input
                  class="form-control"
                  formControlName="customer"
                  placeholder="Nombres y apellidos" /></label
              ><label class="col-12 col-md-6 form-label"
                >Documento<input class="form-control" formControlName="document" placeholder="DNI"
              /></label>
            </div>
            <label class="form-label"
              >Sucursal de retiro<select class="form-select" formControlName="branch">
                <option value="">Selecciona una sucursal</option>
                @for (b of branches(); track b.id) {
                  <option [value]="b.id">{{ b.name }}</option>
                }
              </select></label
            >
            <hr />
            <div class="d-flex justify-content-between align-items-center gap-2 mb-3">
              <h3 class="h6 mb-0">Productos</h3>
              <button class="btn btn-outline-primary" type="button" (click)="addItem()">
                + Agregar
              </button>
            </div>
            @for (item of items(); track $index; let i = $index) {
              <div class="border rounded p-3 mb-3">
                <div class="row g-2">
                  <div class="col-12">
                    <select
                      class="form-select"
                      [attr.aria-label]="'Producto ' + (i + 1)"
                      [value]="item.productId"
                      (change)="selectProduct(i, $event)"
                    >
                      <option [value]="0">Selecciona un producto</option>
                      @for (p of products(); track p.id) {
                        <option [value]="p.id">{{ p.name }}</option>
                      }
                    </select>
                  </div>
                  <label class="col-6 form-label"
                    >Talla<input
                      class="form-control"
                      type="number"
                      [value]="item.size"
                      (input)="setSize(i, $event)" /></label
                  ><label class="col-6 form-label"
                    >Cantidad<input
                      class="form-control"
                      type="number"
                      min="1"
                      [value]="item.quantity"
                      (input)="setQuantity(i, $event)"
                  /></label>
                </div>
                <div class="d-flex justify-content-between align-items-center gap-2 mt-2">
                  <strong>{{
                    price(item.productId) * item.quantity | currency: 'PEN' : 'S/ '
                  }}</strong>
                  <button
                    type="button"
                    class="btn btn-outline-danger btn-sm"
                    [disabled]="items().length === 1"
                    [attr.aria-label]="'Eliminar producto ' + (i + 1)"
                    (click)="removeItem(i)"
                  >
                    <i class="bi bi-trash" aria-hidden="true"></i>
                  </button>
                </div>
              </div>
            }
            <label class="form-label"
              >Observaciones<textarea
                class="form-control"
                formControlName="observations"
                rows="3"
              ></textarea>
            </label>
            @if ((form.touched && form.invalid) || itemError()) {
              <small class="invalid-feedback d-block"
                >Completa todos los datos requeridos del pedido.</small
              >
            }
          </article>
        </div>
        <div class="col-12 col-xl-4">
          <aside class="card shadow-sm p-4">
            <h2 class="h5 mb-3">Resumen</h2>
            <div class="d-flex justify-content-between gap-2 mb-2">
              <span>Subtotal</span><strong>{{ total() | currency: 'PEN' : 'S/ ' }}</strong>
            </div>
            <div class="d-flex justify-content-between gap-2">
              <span>Retiro en tienda</span><strong>S/ 0.00</strong>
            </div>
            <hr />
            <div class="d-flex justify-content-between gap-2 fs-5 mb-3">
              <span>Total</span><strong>{{ total() | currency: 'PEN' : 'S/ ' }}</strong>
            </div>
            <button class="btn btn-primary w-100 mb-2" type="submit">Registrar pedido</button
            ><a class="btn btn-outline-secondary w-100" routerLink="/orders">Cancelar</a>
          </aside>
        </div>
      </div>
    </form>`,
})
export class NewOrderComponent {
  private fb = inject(FormBuilder);
  private orders = inject(OrderService);
  private router = inject(Router);
  products = signal<Product[]>([]);
  branches = signal<Branch[]>([]);
  items = signal<DraftItem[]>([{ productId: 0, quantity: 1, size: 40 }]);
  itemError = signal(false);
  form = this.fb.nonNullable.group({
    customer: ['', Validators.required],
    document: ['', Validators.required],
    branch: ['', Validators.required],
    observations: [''],
  });
  constructor() {
    inject(ProductService)
      .getProducts()
      .subscribe((v) => this.products.set(v.filter((p) => p.active)));
    inject(BranchService)
      .getBranches()
      .subscribe((v) => this.branches.set(v.filter((b) => b.active)));
  }
  addItem(): void {
    this.items.update((v) => [...v, { productId: 0, quantity: 1, size: 40 }]);
  }
  removeItem(i: number): void {
    if (this.items().length > 1) this.items.update((v) => v.filter((_, x) => x !== i));
  }
  updateItem(i: number, changes: Partial<DraftItem>): void {
    this.items.update((v) => v.map((x, n) => (n === i ? { ...x, ...changes } : x)));
  }
  selectProduct(i: number, e: Event): void {
    this.updateItem(i, { productId: Number((e.target as HTMLSelectElement).value) });
  }
  setQuantity(i: number, e: Event): void {
    this.updateItem(i, { quantity: Number((e.target as HTMLInputElement).value) });
  }
  setSize(i: number, e: Event): void {
    this.updateItem(i, { size: Number((e.target as HTMLInputElement).value) });
  }
  price(id: number): number {
    return this.products().find((p) => p.id === id)?.price ?? 0;
  }
  total(): number {
    return this.items().reduce((sum, i) => sum + this.price(i.productId) * i.quantity, 0);
  }
  submit(): void {
    this.form.markAllAsTouched();
    const valid = this.items().every(
      (i) =>
        i.productId > 0 &&
        Number.isInteger(i.quantity) &&
        i.quantity > 0 &&
        Number.isInteger(i.size) &&
        i.size > 0,
    );
    this.itemError.set(!valid);
    if (this.form.invalid || !valid) return;
    const v = this.form.getRawValue();
    this.orders
      .createOrder({
        customer: v.customer,
        customerDocument: v.document,
        branchId: Number(v.branch),
        observations: v.observations,
        items: this.items(),
      })
      .subscribe((o) => this.router.navigate(['/orders', o.id]));
  }
}
