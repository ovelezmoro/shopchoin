import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { EMPTY, catchError, finalize, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';
import { ApiFeedbackService } from '../services/api-feedback.service';

export const apiInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith(environment.apiUrl + '/')) return next(request);
  const auth = inject(AuthService);
  const feedback = inject(ApiFeedbackService);
  const router = inject(Router);
  const write = !['GET', 'HEAD', 'OPTIONS'].includes(request.method);
  const authRequest = request.url.startsWith(`${environment.apiUrl}/auth/`);
  if (auth.accessToken && request.url !== `${environment.apiUrl}/auth/login`) {
    request = request.clone({ setHeaders: { Authorization: `Bearer ${auth.accessToken}` } });
  }
  if (write) {
    feedback.error.set('');
    feedback.pendingWrites.update((n) => n + 1);
  }
  return next(request).pipe(
    catchError((error) => {
      if (error.status === 401) auth.clearSession();
      if (authRequest) return throwError(() => error);
      feedback.error.set(error.status === 0 ? 'No se puede conectar con el servidor.' :
        error.error?.detail || 'No se pudo completar la operación.');
      if (error.status === 401) void router.navigate(['/login']);
      return EMPTY;
    }),
    finalize(() => { if (write) feedback.pendingWrites.update((n) => n - 1); }),
  );
};
