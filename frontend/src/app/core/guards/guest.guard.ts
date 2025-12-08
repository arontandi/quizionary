import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { combineLatest, filter, map, take } from 'rxjs';

export const guestGuard: CanMatchFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return combineLatest([auth.initialized$, auth.currentUser$]).pipe(
    filter(([ready]) => ready),
    take(1),
    map(([_, user]) => (user ? router.createUrlTree(['/home']) : true))
  );
};
