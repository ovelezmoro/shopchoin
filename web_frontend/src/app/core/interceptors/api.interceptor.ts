import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { EMPTY, catchError, finalize, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CsrfService } from '../services/csrf.service';
import { ApiFeedbackService } from '../services/api-feedback.service';

export const apiInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith(environment.apiUrl + '/')) return next(request);
  const csrf = inject(CsrfService);
  const feedback = inject(ApiFeedbackService);
  const router = inject(Router);
  const write = !['GET', 'HEAD', 'OPTIONS'].includes(request.method);
  const authRequest = request.url.startsWith(`${environment.apiUrl}/auth/`);
  request = request.clone({ withCredentials: true });
  if (write) {
    feedback.error.set('');
    feedback.pendingWrites.update((n) => n + 1);
    if (csrf.token) request = request.clone({ setHeaders: { [csrf.headerName]: csrf.token } });
  }
  return next(request).pipe(
    catchError((error) => {
      if (authRequest) return throwError(() => error);
      feedback.error.set(error.status === 0 ? 'No se puede conectar con el servidor.' :
        error.error?.detail || 'No se pudo completar la operación.');
      if (error.status === 401) void router.navigate(['/login']);
      return EMPTY;
    }),
    finalize(() => { if (write) feedback.pendingWrites.update((n) => n - 1); }),
  );
};
