import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { map } from 'rxjs';
import { RouterLink } from '@angular/router';
import { InventoryService } from '../../../core/services/inventory.service';
import { InventoryStatus } from '../../../core/models/shopchain.models';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';
@Component({
  selector: 'app-replenishments',
  imports: [AsyncPipe, RouterLink, StatusBadgePipe],
  template: `<div class="mb-4">
      <div>
        <a class="d-inline-block mb-3" routerLink="/inventory">← Inventario</a>
        <h1 class="h3">Reposiciones sugeridas</h1>
        <p class="text-body-secondary">
          Productos que requieren reabastecimiento según su stock mínimo.
        </p>
      </div>
    </div>
    <article class="card shadow-sm p-4">
      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead class="table-light">
            <tr>
              <th>Producto</th>
              <th>Stock actual</th>
              <th>Stock mínimo</th>
              <th>Sucursal</th>
              <th>Cantidad recomendada</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            @for (i of items$ | async; track i.id) {
              <tr>
                <td>
                  <strong>{{ i.product }}</strong>
                </td>
                <td>{{ i.stock }}</td>
                <td>{{ i.minimumStock }}</td>
                <td>{{ i.branch }}</td>
                <td>
                  <strong>{{ i.minimumStock * 2 - i.stock }} unidades</strong>
                </td>
                <td>
                  <span class="badge" [class]="i.status | statusBadge">{{ i.status }}</span>
                </td>
                <td>
                  <a class="btn btn-sm btn-primary" routerLink="/inventory/movements"
                    >Registrar reposición</a
                  >
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </article>`,
})
export class ReplenishmentsComponent {
  items$ = inject(InventoryService)
    .getInventory()
    .pipe(map((items) => items.filter((i) => i.status !== InventoryStatus.Available)));
}
