import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/components/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./features/home/pages/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'catalog',
        loadComponent: () =>
          import('./features/catalog/pages/catalog.component').then((m) => m.CatalogComponent),
      },
      {
        path: 'catalog/:id',
        loadComponent: () =>
          import('./features/catalog/pages/product-detail.component').then(
            (m) => m.ProductDetailComponent,
          ),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/orders/pages/orders.component').then((m) => m.OrdersComponent),
      },
      {
        path: 'orders/new',
        loadComponent: () =>
          import('./features/orders/pages/new-order.component').then((m) => m.NewOrderComponent),
      },
      {
        path: 'orders/:id',
        loadComponent: () =>
          import('./features/orders/pages/order-detail.component').then(
            (m) => m.OrderDetailComponent,
          ),
      },
      {
        path: 'inventory',
        loadComponent: () =>
          import('./features/inventory/pages/inventory.component').then(
            (m) => m.InventoryComponent,
          ),
      },
      {
        path: 'inventory/movements',
        loadComponent: () =>
          import('./features/inventory/pages/movements.component').then(
            (m) => m.MovementsComponent,
          ),
      },
      {
        path: 'inventory/replenishments',
        loadComponent: () =>
          import('./features/inventory/pages/replenishments.component').then(
            (m) => m.ReplenishmentsComponent,
          ),
      },
      {
        path: 'administration',
        loadComponent: () =>
          import('./features/administration/pages/administration.component').then(
            (m) => m.AdministrationComponent,
          ),
      },
      {
        path: 'administration/products',
        loadComponent: () =>
          import('./features/administration/pages/products-admin.component').then(
            (m) => m.ProductsAdminComponent,
          ),
      },
      {
        path: 'administration/branches',
        loadComponent: () =>
          import('./features/administration/pages/branches-admin.component').then(
            (m) => m.BranchesAdminComponent,
          ),
      },
      {
        path: 'administration/users',
        loadComponent: () =>
          import('./features/administration/pages/users-admin.component').then(
            (m) => m.UsersAdminComponent,
          ),
      },
      { path: '', pathMatch: 'full', redirectTo: 'home' },
    ],
  },
  { path: '**', redirectTo: 'home' },
];
