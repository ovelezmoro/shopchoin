import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product, Category } from '../models/shopchain.models';
import { ProductRequest } from '../models/requests.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/products`;
  getProducts() { return this.http.get<Product[]>(this.url); }
  getProductById(id: number) { return this.http.get<Product>(`${this.url}/${id}`); }
  getCategories() { return this.http.get<Category[]>(`${environment.apiUrl}/categories`); }
  save(product: ProductRequest, id?: number) {
    return id ? this.http.put<Product>(`${this.url}/${id}`, product) : this.http.post<Product>(this.url, product);
  }
  toggle(p: Product) {
    const { sku, name, brand, categoryId, price, description, image } = p;
    return this.save({ sku, name, brand, categoryId, price, description, image, active: !p.active }, p.id);
  }
}
