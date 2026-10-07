import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, map, of, tap, throwError } from 'rxjs';
import { User, UserRole } from '../models/shopchain.models';
import { environment } from '../../../environments/environment';

interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly tokenKey = 'shopchain.accessToken';
  private subject = new BehaviorSubject<User | null>(null);
  readonly currentUser$ = this.subject.asObservable();

  login(identifier: string, password: string) {
    this.clearSession();
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, { identifier, password }).pipe(
      tap((response) => {
        sessionStorage.setItem(this.tokenKey, response.accessToken);
        this.subject.next(response.user);
      }),
      map(() => true),
    );
  }

  restoreSession() {
    if (!this.accessToken) {
      this.clearSession();
      return of(null);
    }
    return this.http.get<User>(`${environment.apiUrl}/auth/me`).pipe(
      tap((user) => this.subject.next(user)),
      catchError((error) => {
        this.subject.next(null);
        if (error.status === 401) this.clearSession();
        return error.status === 401 ? of(null) : throwError(() => error);
      }),
    );
  }

  logout() {
    this.clearSession();
    return of(void 0);
  }

  clearSession(): void {
    sessionStorage.removeItem(this.tokenKey);
    this.subject.next(null);
  }

  get accessToken(): string | null { return sessionStorage.getItem(this.tokenKey); }
  get currentUser(): User | null { return this.subject.value; }
  hasRole(...roles: UserRole[]): boolean {
    return !!this.currentUser && roles.includes(this.currentUser.role);
  }
}
