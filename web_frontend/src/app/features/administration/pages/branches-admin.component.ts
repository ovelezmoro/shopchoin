import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Branch } from '../../../core/models/shopchain.models';
import { BranchService } from '../../../core/services/branch.service';
@Component({
  selector: 'app-branches-admin',
  imports: [ReactiveFormsModule],
  template: `<div
      class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4"
    >
      <div>
        <p class="text-primary small fw-bold mb-1">ADMINISTRACIÓN</p>
        <h1 class="h3">Gestión de sucursales</h1>
        <p class="text-body-secondary mb-0">Configura los puntos de venta y retiro.</p>
      </div>
      <button class="btn btn-primary" (click)="open()">+ Agregar sucursal</button>
    </div>
    @if (showForm()) {
      <form class="card shadow-sm p-4 mb-4" [formGroup]="form" (ngSubmit)="save()">
        <div class="d-flex justify-content-between align-items-center gap-2 mb-3">
          <h2 class="h5 mb-0">Sucursal</h2>
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
            >Nombre<input class="form-control" formControlName="name" /></label
          ><label class="col-12 col-md-6 form-label"
            >Dirección<input class="form-control" formControlName="address" /></label
          ><label class="col-12 col-md-6 form-label"
            >Ubicación<input class="form-control" formControlName="location" /></label
          ><label class="col-12 col-md-6 form-label"
            >Estado<select class="form-select" formControlName="active">
              <option [ngValue]="true">Activa</option>
              <option [ngValue]="false">Inactiva</option>
            </select></label
          >
        </div>
        @if (form.touched && form.invalid) {
          <small class="invalid-feedback d-block">Todos los campos son obligatorios.</small>
        }
        <div class="d-flex justify-content-end mt-3">
          <button class="btn btn-primary">Guardar sucursal</button>
        </div>
      </form>
    }
    <div class="row g-4">
      @for (b of branches(); track b.id) {
        <div class="col-12 col-md-6">
          <article class="card shadow-sm p-4 h-100 flex-row gap-3">
            <i class="bi bi-shop text-success fs-3" aria-hidden="true"></i>
            <div>
              <h2 class="h5">{{ b.name }}</h2>
              <p>{{ b.address }}</p>
              <small>{{ b.location }}</small>
              <div>
                <span
                  class="badge"
                  [class.text-bg-success]="b.active"
                  [class.text-bg-secondary]="!b.active"
                  >{{ b.active ? 'Activa' : 'Inactiva' }}</span
                ><button class="btn btn-link btn-sm" (click)="edit(b)">Editar</button>
              </div>
            </div>
          </article>
        </div>
      }
    </div>`,
})
export class BranchesAdminComponent {
  private fb = inject(FormBuilder);
  private service = inject(BranchService);
  branches = signal<Branch[]>([]);
  showForm = signal(false);
  editingId = signal<number | null>(null);
  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    address: ['', Validators.required],
    location: ['', Validators.required],
    active: [true, Validators.required],
  });
  constructor() {
    this.load();
  }
  load(): void {
    this.service.getBranches().subscribe((v) => this.branches.set(v));
  }
  open(): void {
    this.editingId.set(null);
    this.form.reset({ name: '', address: '', location: '', active: true });
    this.showForm.set(true);
  }
  edit(b: Branch): void {
    this.editingId.set(b.id);
    this.form.setValue({
      name: b.name,
      address: b.address,
      location: b.location,
      active: b.active,
    });
    this.showForm.set(true);
  }
  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.service.save({ id: this.editingId() ?? 0, ...this.form.getRawValue() }).subscribe(() => {
      this.load();
      this.showForm.set(false);
    });
  }
}
