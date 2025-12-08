import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { OpenAIService } from '../../core/services/openai.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RecentQuizActivity } from 'src/app/core/models/quiz.models';
import { ApiService } from 'src/app/core/services/api.service';

type QuizStub = {
  id: string;
  title: string;
  tag?: string;
  updatedAt: string;
  progress?: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [FormsModule, CommonModule, RouterLink]
})
export class HomeComponent implements OnInit {
  recent: RecentQuizActivity[] = [];
  loading = false;
  error = '';

  constructor(private api: ApiService) { }

  ngOnInit(): void {
    this.loading = true;
    this.api.getMyRecentQuizzes().subscribe({
      next: (items) => {
        this.recent = items ?? [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load recent quizzes', err);
        this.error = 'Could not load recent activity.';
        this.loading = false;
      },
    });
  }

  trackRecent(_: number, x: RecentQuizActivity) { return x.quizId; }
}