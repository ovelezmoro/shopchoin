import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Branch, OrderItem, OrderStatus, Product } from '../../../core/models/shopchain.models';
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
  template: `<div class="section-title">Nuevo pedido</div>
    <div class="section-subtitle">Registro de un pedido con retiro en tienda.</div>
    <form [formGroup]="form" (ngSubmit)="submit()">
      <div class="mock-order-layout">
        <article class="card">
          <h2>Datos del pedido</h2>
          <div class="form-grid">
            <label
              >Cliente<input formControlName="customer" placeholder="Nombres y apellidos" /></label
            ><label>Documento<input formControlName="document" placeholder="DNI" /></label>
          </div>
          <label
            >Sucursal de retiro<select formControlName="branch">
              <option value="">Selecciona una sucursal</option>
              @for (b of branches(); track b.id) {
                <option [value]="b.name">{{ b.name }}</option>
              }
            </select></label
          >
          <hr />
          <div class="card-head">
            <h3>Productos</h3>
            <button class="btn outline" type="button" (click)="addItem()">+ Agregar</button>
          </div>
          @for (item of items(); track $index; let i = $index) {
            <div class="order-product">
              <span class="product-thumb small-thumb">♢</span>
              <div class="order-product-fields">
                <select [value]="item.productId" (change)="selectProduct(i, $event)">
                  <option [value]="0">Selecciona un producto</option>
                  @for (p of products(); track p.id) {
                    <option [value]="p.id">{{ p.name }}</option>
                  }
                </select>
                <div>
                  <label
                    >Talla<input
                      type="number"
                      [value]="item.size"
                      (input)="setSize(i, $event)" /></label
                  ><label
                    >Cantidad<input
                      type="number"
                      min="1"
                      [value]="item.quantity"
                      (input)="setQuantity(i, $event)"
                  /></label>
                </div>
              </div>
              <strong>{{ price(item.productId) * item.quantity | currency: 'PEN' : 'S/ ' }}</strong
              ><button type="button" class="icon-danger" (click)="removeItem(i)">×</button>
            </div>
          }
          <label>Observaciones<textarea formControlName="observations" rows="3"></textarea></label>
          @if ((form.touched && form.invalid) || itemError()) {
            <small class="error">Completa todos los datos requeridos del pedido.</small>
          }
        </article>
        <aside class="card order-resume">
          <h2>Resumen</h2>
          <div>
            <span>Subtotal</span><strong>{{ total() | currency: 'PEN' : 'S/ ' }}</strong>
          </div>
          <div><span>Retiro en tienda</span><strong>S/ 0.00</strong></div>
          <hr />
          <div class="total-line">
            <span>Total</span><strong>{{ total() | currency: 'PEN' : 'S/ ' }}</strong>
          </div>
          <button class="btn primary wide" type="submit">Registrar pedido</button
          ><a class="btn secondary wide" routerLink="/orders">Cancelar</a>
        </aside>
      </div>
    </form>`,
})
export class NewOrderComponent {
  private fb = inject(FormBuilder);
  private orders = inject(OrderService);
  private router = inject(Router);
  products = signal<Product[]>([]);
  branches = signal<Branch[]>([]);
  items = signal<DraftItem[]>([{ productId: 1, quantity: 1, size: 42 }]);
  itemError = signal(false);
  form = this.fb.nonNullable.group({
    customer: ['Carlos Ramírez', Validators.required],
    document: ['74125896', Validators.required],
    branch: ['San Isidro', Validators.required],
    observations: ['Retiro presencial. Confirmar disponibilidad antes de preparar.'],
  });
  constructor() {
    inject(ProductService)
      .getProducts()
      .subscribe((v) => this.products.set(v));
    inject(BranchService)
      .getBranches()
      .subscribe((v) => this.branches.set(v));
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
    const valid = this.items().every((i) => i.productId > 0 && i.quantity > 0 && i.size > 0);
    this.itemError.set(!valid);
    if (this.form.invalid || !valid) return;
    const v = this.form.getRawValue();
    const orderItems: OrderItem[] = this.items().map((i) => {
      const p = this.products().find((x) => x.id === i.productId)!;
      return {
        productId: p.id,
        product: p.name,
        price: p.price,
        quantity: i.quantity,
        subtotal: p.price * i.quantity,
        size: i.size,
      };
    });
    const id = Date.now();
    this.orders
      .createOrder({
        id,
        number: `PED-${String(id).slice(-4)}`,
        date: new Date().toLocaleString('es-PE'),
        customer: v.customer,
        customerDocument: v.document,
        branch: v.branch,
        status: OrderStatus.Pending,
        total: this.total(),
        observations: v.observations,
        items: orderItems,
      })
      .subscribe((o) => this.router.navigate(['/orders', o.id]));
  }
}
