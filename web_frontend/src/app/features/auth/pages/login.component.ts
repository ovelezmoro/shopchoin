import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  template: `<main class="login-page">
    <form class="login-card card" [formGroup]="form" (ngSubmit)="submit()">
      <div class="brand-icon">▦</div>
      <h1>ShopChain</h1>
      <p class="login-subtitle">Gestión de inventarios y logística</p>
      <label
        >Correo electrónico<input
          formControlName="identifier"
          autocomplete="username"
          placeholder="usuario@shopchain.pe"
      /></label>
      @if (form.controls.identifier.touched && form.controls.identifier.invalid) {
        <small class="error">El correo electrónico es obligatorio.</small>
      }
      <label
        >Contraseña
        <div class="password">
          <input
            [type]="showPassword() ? 'text' : 'password'"
            formControlName="password"
            autocomplete="current-password"
            placeholder="Ingresa tu contraseña"
          /><button type="button" (click)="showPassword.set(!showPassword())">
            {{ showPassword() ? 'Ocultar' : 'Mostrar' }}
          </button>
        </div></label
      >
      @if (form.controls.password.touched && form.controls.password.invalid) {
        <small class="error">La contraseña es obligatoria.</small>
      }
      <div class="login-options">
        <label class="remember"><input type="checkbox" checked /> Recordarme</label
        ><span>¿Olvidaste tu contraseña?</span>
      </div>
      @if (loginError()) {
        <div class="alert error-box">{{ loginError() }}</div>
      }
      <button class="btn primary wide login-button" type="submit" [disabled]="loading()">
        {{ loading() ? 'Ingresando...' : 'Ingresar' }}
      </button>
      <p class="academic-note">Prototipo académico · Angular + Java</p>
      <div class="demo">admin@shopchain.pe · admin123</div>
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
      next: () => { this.loading.set(false); void this.router.navigate(['/home']); },
      error: (error) => {
        this.loading.set(false);
        this.loginError.set(error.status === 0 ? 'No se puede conectar con el servidor.' : error.error?.detail || 'No se pudo iniciar sesión.');
      },
    });
  }
}
