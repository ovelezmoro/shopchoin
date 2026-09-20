import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BranchStock, InventoryItem, StockMovement } from '../models/shopchain.models';
import { INVENTORY, MOVEMENTS } from '../data/mock-data';
@Injectable({ providedIn: 'root' })
export class InventoryService {
  getInventory(): Observable<InventoryItem[]> {
    return of(INVENTORY.map((i) => ({ ...i })));
  }

  getMovements(): Observable<StockMovement[]> {
    return of(MOVEMENTS.map((m) => ({ ...m })));
  }

  getStockByProduct(productId: number): Observable<BranchStock[]> {
    return of(
      INVENTORY.filter((i) => i.productId === productId).map((i) => ({
        branch: i.branch,
        stock: i.stock,
      })),
    );
  }

  addMovement(movement: StockMovement): Observable<StockMovement> {
    MOVEMENTS.unshift(movement);
    return of(movement);
  }
}
