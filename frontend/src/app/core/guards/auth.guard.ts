import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { combineLatest, filter, map, take } from 'rxjs';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

 return combineLatest([auth.initialized$, auth.currentUser$]).pipe(
    filter(([ready]) => ready),
    take(1),
    map(([_, user]) =>
      user ? true : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } })
    )
  );
};
