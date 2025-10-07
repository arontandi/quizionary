import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { OpenAIService } from '../../core/services/openai.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
    imports: [FormsModule, CommonModule]
})
export class HomeComponent {
  prompt: string = '';
  response: string = '';
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private openAIService: OpenAIService
  ) {}

  onLogout() {
    this.authService
      .logout()
      .then(() => {
        this.router.navigate(['/login']);
      })
      .catch((err) => {
        console.error('Logout failed:', err);
      });
  }

  async generateResponse() {
    if (!this.prompt.trim()) {
      alert('Please enter a prompt');
      return;
    }

    this.loading = true;
    try {
      const messages = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: this.prompt },
      ];
      this.response = await this.openAIService.generateResponse(messages);
    } catch (error) {
      console.error('Error generating response:', error);
      this.response = 'An error occurred. Please try again.';
    } finally {
      this.loading = false;
    }
  }
}
