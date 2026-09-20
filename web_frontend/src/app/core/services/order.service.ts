import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Order } from '../models/shopchain.models';
import { ORDERS } from '../data/mock-data';

@Injectable({ providedIn: 'root' })
export class OrderService {
  getOrders(): Observable<Order[]> {
    return of(ORDERS.map((o) => ({ ...o, items: o.items.map((i) => ({ ...i })) })));
  }

  getOrderById(id: number): Observable<Order | undefined> {
    return of(ORDERS.find((o) => o.id === id));
  }

  createOrder(order: Order): Observable<Order> {
    ORDERS.unshift(order);
    return of(order);
  }
}
