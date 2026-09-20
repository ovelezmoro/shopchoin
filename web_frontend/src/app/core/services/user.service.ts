import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User } from '../models/shopchain.models';
import { USERS } from '../data/mock-data';

@Injectable({ providedIn: 'root' })
export class UserService {
  getUsers(): Observable<User[]> {
    return of(USERS.map((u) => ({ ...u })));
  }

  save(user: User): Observable<User> {
    const i = USERS.findIndex((u) => u.id === user.id);
    i >= 0 ? USERS.splice(i, 1, user) : USERS.push({ ...user, id: Date.now() });
    return of(user);
  }
}
