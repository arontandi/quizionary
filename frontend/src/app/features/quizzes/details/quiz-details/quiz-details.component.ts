import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Quiz } from 'src/app/core/models/quiz.models';
import { ApiService } from 'src/app/core/services/api.service';

import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';

import Chart from 'chart.js/auto';
import type { Chart as ChartInstance } from 'chart.js';
import { ServerQuizDTO } from 'src/app/core/models/server-dto';
import { AttemptSummary } from 'src/app/core/models/attempt.models';
import { mapServerQuizToClient } from 'src/app/core/mappers/quiz.mappers';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-quiz-details',
  imports: [CommonModule, RouterModule, DatePipe, DecimalPipe],
  templateUrl: './quiz-details.component.html',
  styleUrl: './quiz-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuizDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private auth = inject(AuthService);

  bestScorePct: number | null = null;
  avgScorePct: number | null = null;
  avgTimeMin: number | null = null;
  quiz!: Quiz;
  attempts: AttemptSummary[] = [];
  deleting = false;

  createdByLabel: string | null = null;
  private currentUser: any = null;

  @ViewChild('scoreCanvas', { static: true })
  scoreCanvas!: ElementRef<HTMLCanvasElement>;
  private scoreChart?: ChartInstance;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;

    this.auth.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.updateCreatedByLabel();
      this.cdr.markForCheck();
    });

    this.api.getQuiz(id).subscribe((ServerQuiz: ServerQuizDTO) => {
      this.quiz = mapServerQuizToClient(ServerQuiz);
      this.updateCreatedByLabel();
      this.cdr.markForCheck();
    });

    this.api.getAttempts(id).subscribe((attempts) => {
      this.attempts = attempts;
      this.recomputeKpis();
      this.renderOrUpdateChart();
      this.cdr.markForCheck();
    });
  }

  startQuiz() {
    if (!this.quiz?.id) return;
    this.router.navigate(['/quiz', this.quiz.id, 'take']);
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  private updateCreatedByLabel() {
    if (!this.quiz || !this.quiz.createdBy) {
      this.createdByLabel = null;
      return;
    }

    if (this.currentUser && this.quiz.createdBy === this.currentUser.uid) {
      this.createdByLabel =
        this.currentUser.displayName ||
        this.currentUser.email ||
        this.quiz.createdBy;
    } else {
      this.createdByLabel = this.quiz.createdBy;
    }
  }

  private recomputeKpis() {
    if (!this.attempts?.length) {
      this.bestScorePct = this.avgScorePct = this.avgTimeMin = null;
      return;
    }

    const scored = this.attempts.map(a => a.scorePct).filter((s): s is number => typeof s === 'number');

    this.bestScorePct = scored.length ? Math.max(...scored) : null;
    this.avgScorePct = scored.length ? scored.reduce((sum, s) => sum + s, 0) / scored.length : null;

    const withDur = this.attempts.map(a => a.durationSec).filter((d): d is number => typeof d === 'number' && d > 0);

    this.avgTimeMin = withDur.length ? (withDur.reduce((sum, d) => sum + d, 0) / withDur.length) / 60 : null;
  }


  private renderOrUpdateChart() {
    const scored = this.attempts.filter(a => typeof a.scorePct === 'number' && a.completedAt);
    const labels = scored.map(a => new Date(a.completedAt!).toLocaleDateString());
    const data = scored.map(a => a.scorePct as number);

    const cfg = {
      type: 'line' as const,
      data: {
        labels,
        datasets: [{
          data,
          borderWidth: 2,
          tension: 0.25,
          pointRadius: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { min: 0, max: 100, ticks: { stepSize: 20 } } },
        plugins: { legend: { display: false } }
      }
    };

    if (!this.scoreChart) {
      const ctx = this.scoreCanvas.nativeElement.getContext('2d')!;
      this.scoreChart = new Chart(ctx, cfg);
    } else {
      this.scoreChart.data.labels = labels;
      this.scoreChart.data.datasets[0].data = data;
      this.scoreChart.update();
    }
  }

  async onDelete() {
    if (!this.quiz?.id) return;
    const sure = window.confirm('Delete this quiz and all its questions and attempts? This cannot be undone.');
    if (!sure) return;

    this.deleting = true;
    this.cdr.markForCheck();

    this.api.deleteQuiz(this.quiz.id).subscribe({
      next: () => {
        this.deleting = false;
        this.cdr.markForCheck();
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.deleting = false;
        this.cdr.markForCheck();
        alert('Delete failed: ' + (err?.error?.message ?? err.message ?? 'Unknown error'));
      }
    })

  }


  trackAttempt = (_: number, attempt: AttemptSummary) => attempt.id;
}
