import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CsrfService {
  private http = inject(HttpClient);
  token = '';
  headerName = 'X-CSRF-TOKEN';

  refresh() {
    return this.http.get<{ token: string; headerName: string }>(`${environment.apiUrl}/auth/csrf`).pipe(
      tap((csrf) => {
        this.token = csrf.token;
        this.headerName = csrf.headerName;
      }),
    );
  }
}
