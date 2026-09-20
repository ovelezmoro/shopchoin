import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Branch } from '../../../core/models/shopchain.models';
import { BranchService } from '../../../core/services/branch.service';
@Component({
  selector: 'app-branches-admin',
  imports: [ReactiveFormsModule],
  template: `<div class="page-head">
      <div>
        <p class="eyebrow">ADMINISTRACIÓN</p>
        <h1>Gestión de sucursales</h1>
        <p>Configura los puntos de venta y retiro.</p>
      </div>
      <button class="btn primary" (click)="open()">+ Agregar sucursal</button>
    </div>
    @if (showForm()) {
      <form class="card form-card" [formGroup]="form" (ngSubmit)="save()">
        <div class="card-head">
          <h2>Sucursal</h2>
          <button type="button" class="link-btn" (click)="showForm.set(false)">Cerrar</button>
        </div>
        <div class="form-grid">
          <label>Nombre<input formControlName="name" /></label
          ><label>Dirección<input formControlName="address" /></label
          ><label>Ubicación<input formControlName="location" /></label
          ><label
            >Estado<select formControlName="active">
              <option [ngValue]="true">Activa</option>
              <option [ngValue]="false">Inactiva</option>
            </select></label
          >
        </div>
        @if (form.touched && form.invalid) {
          <small class="error">Todos los campos son obligatorios.</small>
        }
        <div class="form-actions"><button class="btn primary">Guardar sucursal</button></div>
      </form>
    }
    <div class="branch-grid">
      @for (b of branches(); track b.id) {
        <article class="card branch-card">
          <span class="admin-icon green">⌂</span>
          <div>
            <h2>{{ b.name }}</h2>
            <p>{{ b.address }}</p>
            <small>{{ b.location }}</small>
            <div>
              <span class="badge" [class.success]="b.active">{{
                b.active ? 'Activa' : 'Inactiva'
              }}</span
              ><button class="action" (click)="edit(b)">Editar</button>
            </div>
          </div>
        </article>
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
