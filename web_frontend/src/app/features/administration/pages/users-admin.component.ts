import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { User, UserRole } from '../../../core/models/shopchain.models';
import { UserService } from '../../../core/services/user.service';
@Component({
  selector: 'app-users-admin',
  imports: [ReactiveFormsModule],
  template: `<div class="page-head">
      <div>
        <p class="eyebrow">ADMINISTRACIÓN</p>
        <h1>Gestión de usuarios</h1>
        <p>Administra accesos y roles del equipo.</p>
      </div>
      <button class="btn primary" (click)="open()">+ Agregar usuario</button>
    </div>
    @if (showForm()) {
      <form class="card form-card" [formGroup]="form" (ngSubmit)="save()">
        <div class="card-head">
          <h2>Usuario</h2>
          <button type="button" class="link-btn" (click)="showForm.set(false)">Cerrar</button>
        </div>
        <div class="form-grid">
          <label>Nombres<input formControlName="names" /></label
          ><label>Correo<input type="email" formControlName="email" /></label
          ><label>Contraseña<input type="password" formControlName="password" /></label
          ><label
            >Rol<select formControlName="role">
              <option value="">Selecciona</option>
              <option>ADMINISTRADOR</option>
              <option>ALMACÉN</option>
              <option>TIENDA</option>
            </select></label
          ><label
            >Estado<select formControlName="active">
              <option [ngValue]="true">Activo</option>
              <option [ngValue]="false">Inactivo</option>
            </select></label
          >
        </div>
        @if (form.touched && form.invalid) {
          <small class="error"
            >Completa los campos. La contraseña requiere al menos 6 caracteres.</small
          >
        }
        <div class="form-actions"><button class="btn primary">Guardar usuario</button></div>
      </form>
    }
    <article class="card">
      <div class="table-wrap">
        <table>
          <thead>
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
                  <span class="badge info">{{ u.role }}</span>
                </td>
                <td>
                  <span class="badge" [class.success]="u.active">{{
                    u.active ? 'Activo' : 'Inactivo'
                  }}</span>
                </td>
                <td><button class="action" (click)="edit(u)">Editar</button></td>
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
    password: ['', [Validators.required, Validators.minLength(6)]],
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
    this.form.reset({ names: '', email: '', password: '', role: '', active: true });
    this.showForm.set(true);
  }
  edit(u: User): void {
    this.editingId.set(u.id);
    this.form.setValue({
      names: u.names,
      email: u.email,
      password: 'secreto',
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
      .save({
        id: this.editingId() ?? 0,
        names: v.names,
        email: v.email,
        role: v.role as UserRole,
        active: v.active,
      })
      .subscribe(() => {
        this.load();
        this.showForm.set(false);
      });
  }
}
