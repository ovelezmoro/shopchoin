import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiFeedbackService } from '../../core/services/api-feedback.service';
import { UserRole } from '../../core/models/shopchain.models';
@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `<div class="shell" [class.open]="menuOpen()">
    <aside class="sidebar">
      <a class="brand" routerLink="/home"><span class="brand-mark">▦</span>ShopChain</a
      ><button class="close-menu" (click)="menuOpen.set(false)">×</button>
      <nav>
        <a routerLink="/home" routerLinkActive="active"><span class="nav-icon">⌂</span>Inicio</a
        ><a routerLink="/catalog" routerLinkActive="active"
          ><span class="nav-icon">♢</span>Catálogo</a
        ><a routerLink="/orders" routerLinkActive="active"><span class="nav-icon">▣</span>Pedidos</a
        ><a
          routerLink="/inventory"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: true }"
          ><span class="nav-icon">▦</span>Inventario</a
        ><a routerLink="/inventory/movements" routerLinkActive="active"
          ><span class="nav-icon">⇄</span>Movimientos</a
        >@if (auth.hasRole(roles.Admin)) {<a routerLink="/administration" routerLinkActive="active"
          ><span class="nav-icon">⚙</span>Administración</a
        >}
      </nav>
    </aside>
    <div class="backdrop" (click)="menuOpen.set(false)"></div>
    <main>
      <header class="topbar">
        <button class="menu" (click)="menuOpen.set(true)">☰</button
        ><span class="platform-name">Plataforma distribuida de inventarios</span>
        <div class="user">
          <span class="notification">♢</span><span class="avatar">{{ auth.currentUser?.names?.charAt(0) }}</span><strong>{{ auth.currentUser?.names }}</strong
          ><button class="link-btn" (click)="logout()">Salir</button>
        </div>
      </header>
      <section class="content">
        @if (feedback.error()) { <div class="alert error-box" role="alert">{{ feedback.error() }} <button class="link-btn" (click)="feedback.error.set('')">Cerrar</button></div> }
        @if (feedback.pendingWrites()) { <p role="status">Guardando...</p> }
        <fieldset [disabled]="feedback.pendingWrites() > 0" style="border:0;padding:0;margin:0;min-width:0"><router-outlet /></fieldset>
      </section>
    </main>
  </div>`,
})
export class MainLayoutComponent {
  auth = inject(AuthService);
  feedback = inject(ApiFeedbackService);
  roles = UserRole;
  private router = inject(Router);
  menuOpen = signal(false);
  logout(): void {
    this.auth.logout().subscribe({
      next: () => { this.feedback.error.set(''); void this.router.navigate(['/login']); },
      error: (error) => {
        if (error.status === 401) { void this.router.navigate(['/login']); return; }
        this.feedback.error.set(error.error?.detail || 'No se pudo cerrar la sesión.');
      },
    });
  }
}
