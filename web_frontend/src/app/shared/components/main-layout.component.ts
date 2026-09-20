import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
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
        ><a routerLink="/administration" routerLinkActive="active"
          ><span class="nav-icon">⚙</span>Administración</a
        >
      </nav>
    </aside>
    <div class="backdrop" (click)="menuOpen.set(false)"></div>
    <main>
      <header class="topbar">
        <button class="menu" (click)="menuOpen.set(true)">☰</button
        ><span class="platform-name">Plataforma distribuida de inventarios</span>
        <div class="user">
          <span class="notification">♢</span><span class="avatar">AV</span><strong>Admin</strong
          ><button class="link-btn" (click)="logout()">Salir</button>
        </div>
      </header>
      <section class="content"><router-outlet /></section>
    </main>
  </div>`,
})
export class MainLayoutComponent {
  auth = inject(AuthService);
  private router = inject(Router);
  menuOpen = signal(false);
  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
