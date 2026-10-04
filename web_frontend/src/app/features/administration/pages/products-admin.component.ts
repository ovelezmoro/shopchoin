import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Product, Category } from '../../../core/models/shopchain.models';
import { ProductService } from '../../../core/services/product.service';
@Component({
  selector: 'app-products-admin',
  imports: [CurrencyPipe, ReactiveFormsModule, FormsModule],
  template: `<div class="page-head">
      <div>
        <p class="eyebrow">ADMINISTRACIÓN</p>
        <h1>Gestión de productos</h1>
        <p>Mantén actualizado el catálogo de calzado deportivo.</p>
      </div>
      <button class="btn primary" (click)="open()">+ Agregar producto</button>
    </div>
    @if (showForm()) {
      <form class="card form-card" [formGroup]="form" (ngSubmit)="save()">
        <div class="card-head">
          <h2>{{ editingId() ? 'Editar' : 'Nuevo' }} producto</h2>
          <button type="button" class="link-btn" (click)="showForm.set(false)">Cerrar</button>
        </div>
        <div class="form-grid">
          <label>SKU<input formControlName="sku" /></label
          ><label>Nombre<input formControlName="name" /></label
          ><label>Marca<input formControlName="brand" /></label
          ><label
            >Categoría<select formControlName="categoryId">
              <option [ngValue]="0">Selecciona</option>
              @for (c of categories(); track c.id) { <option [ngValue]="c.id">{{ c.name }}</option> }
            </select></label
          ><label>Precio<input type="number" min="0" formControlName="price" /></label
          ><label class="full"
            >Descripción<textarea rows="3" formControlName="description"></textarea>
          </label>
        </div>
        @if (form.touched && form.invalid) {
          <small class="error">Completa correctamente todos los campos.</small>
        }
        <div class="form-actions">
          <button type="button" class="btn secondary" (click)="showForm.set(false)">Cancelar</button
          ><button class="btn primary">Guardar producto</button>
        </div>
      </form>
    }
    <article class="card">
      <div class="filters">
        <label class="search"
          >⌕<input [(ngModel)]="query" placeholder="Buscar producto o marca"
        /></label>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Producto</th>
              <th>Marca</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (p of filtered(); track p.id) {
              <tr>
                <td>{{ p.sku }}</td>
                <td>
                  <strong>{{ p.name }}</strong>
                </td>
                <td>{{ p.brand }}</td>
                <td>{{ p.category }}</td>
                <td>{{ p.price | currency: 'PEN' : 'S/ ' }}</td>
                <td>
                  <span class="badge" [class.success]="p.active" [class.muted-badge]="!p.active">{{
                    p.active ? 'Activo' : 'Inactivo'
                  }}</span>
                </td>
                <td>
                  <button class="action" (click)="edit(p)">Editar</button
                  ><button class="action" (click)="toggle(p)">
                    {{ p.active ? 'Desactivar' : 'Activar' }}
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </article>`,
})
export class ProductsAdminComponent {
  private fb = inject(FormBuilder);
  private service = inject(ProductService);
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  showForm = signal(false);
  editingId = signal<number | null>(null);
  query = '';
  form = this.fb.nonNullable.group({
    sku: ['', Validators.required],
    name: ['', Validators.required],
    brand: ['', Validators.required],
    categoryId: [0, Validators.min(1)],
    price: [0, [Validators.required, Validators.min(0.01)]],
    description: ['', Validators.required],
  });
  constructor() {
    this.load();
    this.service.getCategories().subscribe((v) => this.categories.set(v));
  }
  load(): void {
    this.service.getProducts().subscribe((v) => this.products.set(v));
  }
  filtered(): Product[] {
    const q = this.query.toLowerCase();
    return this.products().filter((p) => `${p.name} ${p.brand}`.toLowerCase().includes(q));
  }
  open(): void {
    this.editingId.set(null);
    this.form.reset({
      sku: '',
      name: '',
      brand: '',
      categoryId: 0,
      price: 0,
      description: '',
    });
    this.showForm.set(true);
  }
  edit(p: Product): void {
    this.editingId.set(p.id);
    this.form.patchValue(p);
    this.showForm.set(true);
  }
  toggle(p: Product): void {
    this.service.toggle(p).subscribe(() => this.load());
  }
  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.service
      .save({
        sku: v.sku,
        name: v.name,
        brand: v.brand,
        categoryId: v.categoryId,
        price: v.price,
        description: v.description,
        image: this.products().find((p) => p.id === this.editingId())?.image ?? '',
        active: this.products().find((p) => p.id === this.editingId())?.active ?? true,
      }, this.editingId() ?? undefined)
      .subscribe(() => {
        this.load();
        this.showForm.set(false);
      });
  }
}
