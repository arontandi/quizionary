// frontend/app/core/interceptors/auth-token.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const isApi = req.url.startsWith(environment.apiBase);

  return from(auth.getIdToken()).pipe(
    switchMap(token => {
      const authedReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

      return next(authedReq).pipe(
        catchError((err: HttpErrorResponse) => {
          if (isApi && token && (err.status === 401 || err.status === 403)) {
            if (!router.url.startsWith('/login')) {
              // router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
            }
          }
          return throwError(() => err);
        })
      );
    })
  );
};
