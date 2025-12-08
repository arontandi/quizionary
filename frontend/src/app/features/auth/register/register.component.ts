import { Component } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [FormsModule, CommonModule, RouterModule, RouterLink],
})
export class RegisterComponent {
  displayName = '';
  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';
  loading = false;

  showPassword = false;
  showConfirm = false;

  private readonly reLowercase = /[a-z]/;
  private readonly reUppercase = /[A-Z]/;
  private readonly reDigit = /\d/;
  private readonly reSpecial = /[^\w\s]/;

  constructor(
    private authService: AuthService,
    private api: ApiService,
    private router: Router
  ) {}

  get hasMinLength(): boolean { return (this.password || '').length >= 8; }
  get hasLowercase(): boolean { return this.reLowercase.test(this.password || ''); }
  get hasUppercase(): boolean { return this.reUppercase.test(this.password || ''); }
  get hasDigit(): boolean { return this.reDigit.test(this.password || ''); }
  get hasSymbol(): boolean { return this.reSpecial.test(this.password || ''); }

  get passwordStrong(): boolean {
    return this.hasMinLength && this.hasLowercase && this.hasUppercase && this.hasDigit && this.hasSymbol;
  }

  get passwordsMismatch() {
    return !!this.password && !!this.confirmPassword && this.password !== this.confirmPassword;
  }

  async onRegister(form: NgForm) {
    if (this.loading || !form.valid || this.passwordsMismatch || !this.passwordStrong) return;

    this.errorMessage = '';
    this.loading = true;
    try {
      await this.authService.register(this.email.trim(), this.password, this.displayName.trim());
      await firstValueFrom(this.api.createUserProfile(this.displayName.trim()));

      await this.router.navigate(['/home']);
    } catch (err) {
      console.error('Registration failed:', err);
      this.errorMessage = 'Registration failed. Please try again.';
    } finally {
      this.loading = false;
    }
  }
}
