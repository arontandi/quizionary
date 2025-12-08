import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [FormsModule, CommonModule, RouterModule]
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  loading = false;
  showPassword = false;

  constructor(private authService: AuthService, private router: Router) { }

  async onLogin(ev?: Event) {
    ev?.preventDefault();
    if (this.loading) return;
    this.errorMessage = '';
    this.loading = true;
    try {
      await this.authService.login(this.email.trim(), this.password);
      this.router.navigate(['/home']);
    } catch (err) {
      console.error('Login failed:', err);
      this.errorMessage = 'Invalid email or password.';
    } finally {
      this.loading = false;
    }
  }
}
