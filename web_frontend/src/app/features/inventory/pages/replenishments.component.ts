import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { map } from 'rxjs';
import { RouterLink } from '@angular/router';
import { InventoryService } from '../../../core/services/inventory.service';
import { InventoryStatus } from '../../../core/models/shopchain.models';
@Component({
  selector: 'app-replenishments',
  imports: [AsyncPipe, RouterLink],
  template: `<div class="page-head">
      <div>
        <a class="back" routerLink="/inventory">← Inventario</a>
        <h1>Reposiciones sugeridas</h1>
        <p>Productos que requieren reabastecimiento según su stock mínimo.</p>
      </div>
    </div>
    <article class="card">
      <div class="table-wrap">
        <table>
          <thead>
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
                  <span class="badge" [attr.data-status]="i.status">{{ i.status }}</span>
                </td>
                <td>
                  <a class="btn small primary" routerLink="/inventory/movements"
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
