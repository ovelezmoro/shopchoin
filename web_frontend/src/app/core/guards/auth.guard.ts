import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.restoreSession().pipe(
    map((user) => {
      if (!user) return router.createUrlTree(['/login']);
      const roles = route.data['roles'];
      return !roles || roles.includes(user.role) ? true : router.createUrlTree(['/home']);
    }),
    catchError(() => of(router.createUrlTree(['/login']))),
  );
};
