import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/shopchain.models';
import { UserRequest } from '../models/requests.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/users`;
  getUsers() { return this.http.get<User[]>(this.url); }
  save(user: UserRequest, id?: number) {
    return id ? this.http.put<User>(`${this.url}/${id}`, user) : this.http.post<User>(this.url, user);
  }
}
