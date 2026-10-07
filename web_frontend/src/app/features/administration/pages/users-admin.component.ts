import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { User, UserRole } from '../../../core/models/shopchain.models';
import { UserService } from '../../../core/services/user.service';
@Component({
  selector: 'app-users-admin',
  imports: [ReactiveFormsModule],
  template: `<div
      class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4"
    >
      <div>
        <p class="text-primary small fw-bold mb-1">ADMINISTRACIÓN</p>
        <h1 class="h3">Gestión de usuarios</h1>
        <p class="text-body-secondary mb-0">Administra accesos y roles del equipo.</p>
      </div>
      <button class="btn btn-primary" (click)="open()">+ Agregar usuario</button>
    </div>
    @if (showForm()) {
      <form class="card shadow-sm p-4 mb-4" [formGroup]="form" (ngSubmit)="save()">
        <div class="d-flex justify-content-between align-items-center gap-2 mb-3">
          <h2 class="h5 mb-0">Usuario</h2>
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
            >Nombres<input class="form-control" formControlName="names" /></label
          ><label class="col-12 col-md-6 form-label"
            >Correo<input class="form-control" type="email" formControlName="email" /></label
          ><label class="col-12 col-md-6 form-label"
            >Contraseña<input
              class="form-control"
              type="password"
              formControlName="password" /></label
          ><label class="col-12 col-md-6 form-label"
            >Rol<select class="form-select" formControlName="role">
              <option value="">Selecciona</option>
              <option>ADMINISTRADOR</option>
              <option>ALMACÉN</option>
              <option>TIENDA</option>
            </select></label
          ><label class="col-12 col-md-6 form-label"
            >Estado<select class="form-select" formControlName="active">
              <option [ngValue]="true">Activo</option>
              <option [ngValue]="false">Inactivo</option>
            </select></label
          >
        </div>
        @if (form.touched && form.invalid) {
          <small class="invalid-feedback d-block"
            >Completa los campos. La contraseña requiere al menos 8 caracteres; al editar puedes
            dejarla vacía para conservarla.</small
          >
        }
        <div class="d-flex justify-content-end mt-3">
          <button class="btn btn-primary">Guardar usuario</button>
        </div>
      </form>
    }
    <article class="card shadow-sm p-4">
      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead class="table-light">
            <tr>
              <th>Nombres</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (u of users(); track u.id) {
              <tr>
                <td>
                  <strong>{{ u.names }}</strong>
                </td>
                <td>{{ u.email }}</td>
                <td>
                  <span class="badge text-bg-info">{{ u.role }}</span>
                </td>
                <td>
                  <span
                    class="badge"
                    [class.text-bg-success]="u.active"
                    [class.text-bg-secondary]="!u.active"
                    >{{ u.active ? 'Activo' : 'Inactivo' }}</span
                  >
                </td>
                <td><button class="btn btn-link btn-sm" (click)="edit(u)">Editar</button></td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </article>`,
})
export class UsersAdminComponent {
  private fb = inject(FormBuilder);
  private service = inject(UserService);
  users = signal<User[]>([]);
  showForm = signal(false);
  editingId = signal<number | null>(null);
  form = this.fb.nonNullable.group({
    names: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['', Validators.required],
    active: [true, Validators.required],
  });
  constructor() {
    this.load();
  }
  load(): void {
    this.service.getUsers().subscribe((v) => this.users.set(v));
  }
  open(): void {
    this.editingId.set(null);
    this.form.controls.password.setValidators([Validators.required, Validators.minLength(8)]);
    this.form.reset({ names: '', email: '', password: '', role: '', active: true });
    this.showForm.set(true);
  }
  edit(u: User): void {
    this.editingId.set(u.id);
    this.form.controls.password.setValidators([Validators.minLength(8)]);
    this.form.setValue({
      names: u.names,
      email: u.email,
      password: '',
      role: u.role,
      active: u.active,
    });
    this.showForm.set(true);
  }
  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.service
      .save(
        {
          ...(v.password ? { password: v.password } : {}),
          names: v.names,
          email: v.email,
          role: v.role as UserRole,
          active: v.active,
        },
        this.editingId() ?? undefined,
      )
      .subscribe(() => {
        this.load();
        this.showForm.set(false);
      });
  }
}
