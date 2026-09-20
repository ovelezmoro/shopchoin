import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, delay, of } from 'rxjs';
import { User, UserRole } from '../models/shopchain.models';
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly key = 'shopchain_session';
  private readonly subject = new BehaviorSubject<User | null>(this.read());
  readonly currentUser$ = this.subject.asObservable();

  login(identifier: string, password: string): Observable<boolean> {
    const valid =
      identifier.trim().toLowerCase() === 'admin@shopchain.pe' && password === 'admin123';
    if (valid) {
      const user: User = {
        id: 1,
        names: 'Administrador ShopChain',
        email: 'admin@shopchain.pe',
        role: UserRole.Admin,
        active: true,
      };
      localStorage.setItem(this.key, JSON.stringify(user));
      this.subject.next(user);
    }
    return of(valid).pipe(delay(300));
  }

  logout(): void {
    localStorage.removeItem(this.key);
    this.subject.next(null);
  }

  isAuthenticated(): boolean {
    return this.subject.value !== null;
  }

  get currentUser(): User | null {
    return this.subject.value;
  }

  private read(): User | null {
    const value = localStorage.getItem(this.key);
    if (!value) return null;
    try {
      return JSON.parse(value) as User;
    } catch {
      localStorage.removeItem(this.key);
      return null;
    }
  }
}
