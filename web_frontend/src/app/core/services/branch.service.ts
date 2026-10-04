import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Branch } from '../models/shopchain.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BranchService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/branches`;
  getBranches() { return this.http.get<Branch[]>(this.url); }
  save(branch: Branch) {
    const { id, ...body } = branch;
    return id ? this.http.put<Branch>(`${this.url}/${id}`, body) : this.http.post<Branch>(this.url, body);
  }
}
