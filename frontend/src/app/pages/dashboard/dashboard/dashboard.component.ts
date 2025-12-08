import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal, effect } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Quiz } from 'src/app/core/models/quiz.models';
import { ApiService } from 'src/app/core/services/api.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type SortKey = 'createdAt_desc' | 'createdAt_asc' | 'title_asc' | 'title_desc';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  private api = inject(ApiService);
  private destroyRef = inject(DestroyRef);

  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  q = signal<string>('');
  sort = signal<SortKey>('createdAt_desc');

  allQuizzes = signal<Quiz[]>([]);
  visibleQuizzes = signal<Quiz[]>([]);

  constructor() {
    this.fetch();
    effect(() => {
      const term = this.q().toLowerCase();
      const sorted = [...this.allQuizzes()].sort((a, b) => {
        switch (this.sort()) {
          case 'createdAt_asc': return a.createdAt.localeCompare(b.createdAt);
          case 'createdAt_desc': return b.createdAt.localeCompare(a.createdAt);
          case 'title_asc': return a.title.localeCompare(b.title);
          case 'title_desc': return b.title.localeCompare(a.title);
        }
      });
      const filtered = term
        ? sorted.filter(q =>
          (q.title ?? '').toLowerCase().includes(term) ||
          (q.description ?? '').toLowerCase().includes(term)
        )
        : sorted;
      this.visibleQuizzes.set(filtered);
    });
  }

  async fetch() {
    this.loading.set(true);
    this.error.set(null);
    this.api.getMyQuizzes().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: items => { this.allQuizzes.set(items); this.loading.set(false); },
      error: err => { this.error.set('Failed to load quizzes.'); this.loading.set(false); }
    })
  }

  onSearch(term: string) { this.q.set(term.trim()); }
  onSort(sort: SortKey) { this.sort.set(sort); }

  trackById = (_: number, q: Quiz) => q.id;
}
