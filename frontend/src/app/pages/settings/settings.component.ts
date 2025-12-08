import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { firstValueFrom, map } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-settings',
  imports: [RouterModule, NgIf, AsyncPipe, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  loading = false;
  error = '';

  displayName = '';
  nameSaving = false;
  nameError = '';
  nameSuccess = '';

  userLabel$ = this.auth.currentUser$.pipe(
    map(user => {
      if (!user) return 'Visitor';
      return user.displayName || user.email || 'User';
    })
  );

  constructor() {
    this.auth.currentUser$.subscribe(user => {
      this.displayName = user?.displayName ?? '';
      this.cdr.markForCheck();
    });
  }


  async onLogout() {
    if (this.loading) return;
    this.error = '';

    try {
      await this.auth.logout();
      await this.router.navigate(['/login']);
    } catch (err) {
      this.error = 'Could not log out. Please try again.';
      this.loading = false;
    }
  }

  async onChangeDisplayName() {
    if (!this.displayName.trim()) {
      this.nameError = 'Username cannot be empty.';
      this.nameSuccess = '';
      return;
    }

    this.nameError = '';
    this.nameSuccess = '';
    this.nameSaving = true;
    this.cdr.markForCheck();

    try {
      await this.auth.updateDisplayName(this.displayName.trim());
      await firstValueFrom(this.api.createUserProfile(this.displayName.trim()));

      this.nameSuccess = 'Username updated successfully.';
    } catch (err) {
      console.error(err);
      this.nameError = 'Could not update username. Please try again.';
    } finally {
      this.nameSaving = false;
      this.cdr.markForCheck();
    }
  }

  async onDeleteAccount() {
    const sure = confirm(
      'This will permanently delete your account. This action cannot be undone. Are you sure?'
    );
    if (!sure) return;

    this.error = '';
    this.loading = true;

    try {
      await firstValueFrom(this.api.deleteMyProfile());
      await this.auth.deleteAccount();
      await this.router.navigate(['/login']);
    } catch (err) {
      console.error(err);
      this.error = 'Could not delete account. You may need to log in again and then retry.';
    } finally {
      this.loading = false;
    }
  }

}
