import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Product, Category } from '../../../core/models/shopchain.models';
import { ProductService } from '../../../core/services/product.service';
@Component({
  selector: 'app-products-admin',
  imports: [CurrencyPipe, ReactiveFormsModule, FormsModule],
  template: `<div
      class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4"
    >
      <div>
        <p class="text-primary small fw-bold mb-1">ADMINISTRACIÓN</p>
        <h1 class="h3">Gestión de productos</h1>
        <p class="text-body-secondary mb-0">Mantén actualizado el catálogo de calzado deportivo.</p>
      </div>
      <button class="btn btn-primary" (click)="open()">+ Agregar producto</button>
    </div>
    @if (showForm()) {
      <form class="card shadow-sm p-4 mb-4" [formGroup]="form" (ngSubmit)="save()">
        <div class="d-flex justify-content-between align-items-center gap-2 mb-3">
          <h2 class="h5 mb-0">{{ editingId() ? 'Editar' : 'Nuevo' }} producto</h2>
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
            >SKU<input class="form-control" formControlName="sku" /></label
          ><label class="col-12 col-md-6 form-label"
            >Nombre<input class="form-control" formControlName="name" /></label
          ><label class="col-12 col-md-6 form-label"
            >Marca<input class="form-control" formControlName="brand" /></label
          ><label class="col-12 col-md-6 form-label"
            >Categoría<select class="form-select" formControlName="categoryId">
              <option [ngValue]="0">Selecciona</option>
              @for (c of categories(); track c.id) {
                <option [ngValue]="c.id">{{ c.name }}</option>
              }
            </select></label
          ><label class="col-12 col-md-6 form-label"
            >Precio<input
              class="form-control"
              type="number"
              min="0"
              formControlName="price" /></label
          ><label class="col-12 form-label"
            >Descripción<textarea
              class="form-control"
              rows="3"
              formControlName="description"
            ></textarea>
          </label>
        </div>
        @if (form.touched && form.invalid) {
          <small class="invalid-feedback d-block">Completa correctamente todos los campos.</small>
        }
        <div class="d-flex flex-wrap justify-content-end gap-2 mt-3">
          <button type="button" class="btn btn-outline-secondary" (click)="showForm.set(false)">
            Cancelar</button
          ><button class="btn btn-primary">Guardar producto</button>
        </div>
      </form>
    }
    <article class="card shadow-sm p-4">
      <div class="mb-3">
        <label class="d-block"
          ><span class="visually-hidden">Buscar producto o marca</span
          ><input class="form-control" [(ngModel)]="query" placeholder="Buscar producto o marca"
        /></label>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead class="table-light">
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
                  <span
                    class="badge"
                    [class.text-bg-success]="p.active"
                    [class.text-bg-secondary]="!p.active"
                    >{{ p.active ? 'Activo' : 'Inactivo' }}</span
                  >
                </td>
                <td>
                  <button class="btn btn-link btn-sm" (click)="edit(p)">Editar</button
                  ><button class="btn btn-link btn-sm" (click)="toggle(p)">
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
      .save(
        {
          sku: v.sku,
          name: v.name,
          brand: v.brand,
          categoryId: v.categoryId,
          price: v.price,
          description: v.description,
          image: this.products().find((p) => p.id === this.editingId())?.image ?? '',
          active: this.products().find((p) => p.id === this.editingId())?.active ?? true,
        },
        this.editingId() ?? undefined,
      )
      .subscribe(() => {
        this.load();
        this.showForm.set(false);
      });
  }
}
