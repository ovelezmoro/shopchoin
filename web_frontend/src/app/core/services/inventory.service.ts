import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { InventoryItem, StockMovement } from '../models/shopchain.models';
import { InventoryRequest, MovementRequest } from '../models/requests.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private http = inject(HttpClient);
  private url = environment.apiUrl;
  getInventory() { return this.http.get<InventoryItem[]>(`${this.url}/inventory`); }
  getMovements() { return this.http.get<StockMovement[]>(`${this.url}/stock-movements`); }
  getStockByProduct(productId: number) {
    return this.http.get<InventoryItem[]>(`${this.url}/inventory`, { params: { productId } });
  }
  register(body: InventoryRequest) { return this.http.post<InventoryItem>(`${this.url}/inventory`, body); }
  addMovement(body: MovementRequest) { return this.http.post<StockMovement>(`${this.url}/stock-movements`, body); }
}
