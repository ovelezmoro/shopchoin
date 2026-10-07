import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  template: `<main class="min-vh-100 d-flex align-items-center justify-content-center p-3">
    <form
      class="login-card card shadow-sm w-100 p-4 p-sm-5"
      [formGroup]="form"
      (ngSubmit)="submit()"
    >
      <div class="text-center text-primary fs-1 mb-3">
        <i class="bi bi-grid-fill" aria-hidden="true"></i>
      </div>
      <h1 class="h3 text-center">ShopChain</h1>
      <p class="text-body-secondary text-center mb-4">Gestión de inventarios y logística</p>
      <label class="form-label"
        >Correo electrónico<input
          class="form-control mt-2"
          formControlName="identifier"
          autocomplete="username"
          placeholder="usuario@shopchain.pe"
      /></label>
      @if (form.controls.identifier.touched && form.controls.identifier.invalid) {
        <small class="invalid-feedback d-block">El correo electrónico es obligatorio.</small>
      }
      <label class="form-label mt-3" for="loginPassword">Contraseña</label>
      <div class="input-group">
        <input
          class="form-control"
          id="loginPassword"
          [type]="showPassword() ? 'text' : 'password'"
          formControlName="password"
          autocomplete="current-password"
          placeholder="Ingresa tu contraseña"
        /><button
          class="btn btn-outline-secondary"
          type="button"
          [attr.aria-pressed]="showPassword()"
          (click)="showPassword.set(!showPassword())"
        >
          {{ showPassword() ? 'Ocultar' : 'Mostrar' }}
        </button>
      </div>
      @if (form.controls.password.touched && form.controls.password.invalid) {
        <small class="invalid-feedback d-block">La contraseña es obligatoria.</small>
      }
      <div class="d-flex flex-wrap justify-content-between gap-2 my-3 small">
        <label class="form-check-label"
          ><input class="form-check-input me-1" type="checkbox" checked /> Recordarme</label
        ><span class="text-body-secondary">¿Olvidaste tu contraseña?</span>
      </div>
      @if (loginError()) {
        <div class="alert alert-danger" role="alert">{{ loginError() }}</div>
      }
      <button class="btn btn-primary w-100" type="submit" [disabled]="loading()">
        @if (loading()) {
          <span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
        }
        {{ loading() ? 'Ingresando...' : 'Ingresar' }}
      </button>
      <p class="text-body-secondary text-center small mt-4 mb-1">
        Prototipo académico · Angular + Java
      </p>
      <div class="text-body-secondary text-center small">admin@shopchain.pe · admin123</div>
    </form>
  </main>`,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  showPassword = signal(false);
  loading = signal(false);
  loginError = signal('');
  form = this.fb.nonNullable.group({
    identifier: ['', Validators.required],
    password: ['', Validators.required],
  });
  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.loading.set(true);
    this.loginError.set('');
    const v = this.form.getRawValue();
    this.auth.login(v.identifier, v.password).subscribe({
      next: () => {
        this.loading.set(false);
        void this.router.navigate(['/home']);
      },
      error: (error) => {
        this.loading.set(false);
        this.loginError.set(
          error.status === 0
            ? 'No se puede conectar con el servidor.'
            : error.error?.detail || 'No se pudo iniciar sesión.',
        );
      },
    });
  }
}
