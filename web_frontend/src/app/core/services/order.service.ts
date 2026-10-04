import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Order, OrderStatus } from '../models/shopchain.models';
import { OrderRequest } from '../models/requests.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/orders`;
  getOrders() { return this.http.get<Order[]>(this.url); }
  getOrderById(id: number) { return this.http.get<Order>(`${this.url}/${id}`); }
  createOrder(order: OrderRequest) { return this.http.post<Order>(this.url, order); }
  updateStatus(id: number, status: OrderStatus) {
    return this.http.patch<Order>(`${this.url}/${id}/status`, { status });
  }
}
