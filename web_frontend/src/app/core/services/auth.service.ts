import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, catchError, map, of, switchMap, tap, throwError } from 'rxjs';
import { User, UserRole } from '../models/shopchain.models';
import { environment } from '../../../environments/environment';
import { CsrfService } from './csrf.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private csrf = inject(CsrfService);
  private subject = new BehaviorSubject<User | null>(null);
  readonly currentUser$ = this.subject.asObservable();

  login(identifier: string, password: string) {
    const body = new HttpParams().set('identifier', identifier).set('password', password);
    return this.csrf.refresh().pipe(
      switchMap(() => this.http.post<User>(`${environment.apiUrl}/auth/login`, body)),
      switchMap((user) => this.csrf.refresh().pipe(tap(() => this.subject.next(user)))),
      map(() => true),
    );
  }

  restoreSession() {
    return this.http.get<User>(`${environment.apiUrl}/auth/me`).pipe(
      switchMap((user) => this.csrf.refresh().pipe(map(() => user))),
      tap((user) => this.subject.next(user)),
      catchError((error) => {
        this.subject.next(null);
        return error.status === 401 ? of(null) : throwError(() => error);
      }),
    );
  }

  logout() {
    return this.http.post<void>(`${environment.apiUrl}/auth/logout`, {}).pipe(
      tap(() => { this.subject.next(null); this.csrf.token = ''; }),
    );
  }

  get currentUser(): User | null { return this.subject.value; }
  hasRole(...roles: UserRole[]): boolean {
    return !!this.currentUser && roles.includes(this.currentUser.role);
  }
}
