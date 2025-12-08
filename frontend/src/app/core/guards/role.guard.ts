import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService, Role } from '../services/auth.service';
import { from } from 'rxjs';
import { map, take } from 'rxjs/operators';

export function canActivateRole(allowed: Role[]): CanActivateFn {
  return (_route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    return from(auth.role()).pipe(
      take(1),
      map(role =>
        allowed.includes(role)
          ? true
          : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } })
      )
    );
  };
}
