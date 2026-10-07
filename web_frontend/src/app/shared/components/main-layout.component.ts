import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiFeedbackService } from '../../core/services/api-feedback.service';
import { UserRole } from '../../core/models/shopchain.models';
@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `<div>
    <aside
      class="offcanvas-lg offcanvas-start bg-body border-end app-sidebar"
      tabindex="-1"
      id="mainNavigation"
      aria-labelledby="navigationTitle"
    >
      <div class="d-flex align-items-center justify-content-between p-3 border-bottom">
        <a
          class="fs-4 fw-bold text-decoration-none"
          routerLink="/home"
          id="navigationTitle"
          data-bs-dismiss="offcanvas"
          data-bs-target="#mainNavigation"
          ><i class="bi bi-grid-fill me-2" aria-hidden="true"></i>ShopChain</a
        >
        <button
          type="button"
          class="btn-close d-lg-none"
          data-bs-dismiss="offcanvas"
          data-bs-target="#mainNavigation"
          aria-label="Cerrar menú"
        ></button>
      </div>
      <div class="offcanvas-body p-3">
        <nav class="nav nav-pills flex-column gap-2 w-100" aria-label="Navegación principal">
          <a
            class="nav-link"
            routerLink="/home"
            routerLinkActive="active"
            ariaCurrentWhenActive="page"
            data-bs-dismiss="offcanvas"
            data-bs-target="#mainNavigation"
            ><i class="bi bi-house me-2" aria-hidden="true"></i>Inicio</a
          >
          <a
            class="nav-link"
            routerLink="/catalog"
            routerLinkActive="active"
            ariaCurrentWhenActive="page"
            data-bs-dismiss="offcanvas"
            data-bs-target="#mainNavigation"
            ><i class="bi bi-box-seam me-2" aria-hidden="true"></i>Catálogo</a
          >
          <a
            class="nav-link"
            routerLink="/orders"
            routerLinkActive="active"
            ariaCurrentWhenActive="page"
            data-bs-dismiss="offcanvas"
            data-bs-target="#mainNavigation"
            ><i class="bi bi-bag me-2" aria-hidden="true"></i>Pedidos</a
          >
          <a
            class="nav-link"
            routerLink="/inventory"
            routerLinkActive="active"
            ariaCurrentWhenActive="page"
            [routerLinkActiveOptions]="{ exact: true }"
            data-bs-dismiss="offcanvas"
            data-bs-target="#mainNavigation"
            ><i class="bi bi-boxes me-2" aria-hidden="true"></i>Inventario</a
          >
          <a
            class="nav-link"
            routerLink="/inventory/movements"
            routerLinkActive="active"
            ariaCurrentWhenActive="page"
            data-bs-dismiss="offcanvas"
            data-bs-target="#mainNavigation"
            ><i class="bi bi-arrow-left-right me-2" aria-hidden="true"></i>Movimientos</a
          >
          @if (auth.hasRole(roles.Admin)) {
            <a
              class="nav-link"
              routerLink="/administration"
              routerLinkActive="active"
              ariaCurrentWhenActive="page"
              data-bs-dismiss="offcanvas"
              data-bs-target="#mainNavigation"
              ><i class="bi bi-gear me-2" aria-hidden="true"></i>Administración</a
            >
          }
        </nav>
      </div>
    </aside>
    <main class="app-main min-vh-100">
      <header class="navbar bg-body border-bottom sticky-top px-3 px-lg-4 gap-2">
        <button
          type="button"
          class="btn btn-outline-primary d-lg-none"
          data-bs-toggle="offcanvas"
          data-bs-target="#mainNavigation"
          aria-controls="mainNavigation"
          aria-label="Abrir menú"
        >
          <i class="bi bi-list" aria-hidden="true"></i>
        </button>
        <span class="text-body-secondary d-none d-lg-inline"
          >Plataforma distribuida de inventarios</span
        >
        <div class="d-flex align-items-center gap-2 ms-auto">
          <span class="rounded-circle text-bg-primary px-3 py-2" aria-hidden="true">{{
            auth.currentUser?.names?.charAt(0)
          }}</span>
          <strong class="d-none d-sm-inline">{{ auth.currentUser?.names }}</strong>
          <button class="btn btn-outline-secondary btn-sm" (click)="logout()">
            <i class="bi bi-box-arrow-right me-1" aria-hidden="true"></i>Salir
          </button>
        </div>
      </header>
      <section class="container-fluid p-3 p-lg-4">
        @if (feedback.error()) {
          <div class="alert alert-danger alert-dismissible" role="alert">
            {{ feedback.error()
            }}<button
              type="button"
              class="btn-close"
              (click)="feedback.error.set('')"
              aria-label="Cerrar alerta"
            ></button>
          </div>
        }
        @if (feedback.pendingWrites()) {
          <div class="alert alert-info d-flex align-items-center gap-2" role="status">
            <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>Guardando...
          </div>
        }
        <fieldset
          class="border-0 p-0 m-0"
          [disabled]="feedback.pendingWrites() > 0"
          [attr.aria-busy]="feedback.pendingWrites() > 0"
        >
          <router-outlet />
        </fieldset>
      </section>
    </main>
  </div>`,
})
export class MainLayoutComponent {
  auth = inject(AuthService);
  feedback = inject(ApiFeedbackService);
  roles = UserRole;
  private router = inject(Router);
  logout(): void {
    this.auth.logout().subscribe({
      next: () => {
        this.feedback.error.set('');
        void this.router.navigate(['/login']);
      },
    });
  }
}
