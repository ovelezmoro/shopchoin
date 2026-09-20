import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { Product } from '../models/shopchain.models';
import { PRODUCTS } from '../data/mock-data';

@Injectable({ providedIn: 'root' })
export class ProductService {
  getProducts(): Observable<Product[]> {
    return of(PRODUCTS.map((p) => ({ ...p })));
  }

  getProductById(id: number): Observable<Product | undefined> {
    return this.getProducts().pipe(map((list) => list.find((p) => p.id === id)));
  }

  save(product: Product): Observable<Product> {
    const i = PRODUCTS.findIndex((p) => p.id === product.id);
    i >= 0 ? PRODUCTS.splice(i, 1, product) : PRODUCTS.push({ ...product, id: Date.now() });
    return of(product);
  }

  toggle(id: number): void {
    const p = PRODUCTS.find((item) => item.id === id);
    if (p) p.active = !p.active;
  }
}
