import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map, switchMap } from 'rxjs';
import { AttemptDetail } from 'src/app/core/models/attempt.models';
import { AnyQuestion, FillBlank, Matching, MultipleChoice, OpenEnded, TrueFalse } from 'src/app/core/models/question.models';
import { Quiz } from 'src/app/core/models/quiz.models';
import { ApiService } from 'src/app/core/services/api.service';

@Component({
  selector: 'app-attempt-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attempt-view.component.html',
  styleUrl: './attempt-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttemptViewComponent {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private router = inject(Router);

  private vm$ = this.route.paramMap.pipe(
    switchMap(params => {
      const quizId = params.get('id')!;
      const attemptId = params.get('attemptId')!;
      return this.api.getQuiz(quizId).pipe(
        switchMap((quiz: Quiz) =>
          this.api.getAttempt(quizId, attemptId).pipe(
            map((attempt: AttemptDetail) => ({ quiz, attempt }))
          )
        )
      );
    })
  );

  vm = toSignal<{ quiz: Quiz; attempt: AttemptDetail } | null>(this.vm$, { initialValue: null });

  quiz = computed(() => this.vm()?.quiz ?? null);
  attempt = computed(() => this.vm()?.attempt ?? null);
  answers = computed(() => this.attempt()?.answers ?? ({} as Record<string, any>));

  trackById = (_: number, q: { id: string }) => q.id;
  trackByIndex = (i: number) => i;

  goBack(quizId: string) {
    this.router.navigate(['/quiz', quizId]);
  }

  fmtDuration(sec?: number) {
    if (sec == null) return '-';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  }

  isMCQ(q: AnyQuestion): q is MultipleChoice { return q?.type === 'multipleChoice'; }
  isTF(q: AnyQuestion): q is TrueFalse { return q?.type === 'trueFalse'; }
  isFill(q: AnyQuestion): q is FillBlank { return q?.type === 'fillBlank'; }
  isMatch(q: AnyQuestion): q is Matching { return q?.type === 'matching'; }
  isOpen(q: AnyQuestion): q is OpenEnded { return q?.type === 'openEnded'; }

  getResult(qid: string | undefined) {
    const per = this.attempt()?.perQuestion ?? [];
    return per.find(p => p.qid === qid) ?? null;
  }

  isCorrect(q: AnyQuestion): boolean {
    return !!this.getResult(q.id)?.correct;
  }
  private norm(s: unknown) { return String(s ?? '').trim().toLowerCase(); }

  // MCQ
  selectedIndex(q: MultipleChoice): number | null {
    const v = this.answers()[q.id];
    return typeof v === 'number' ? v : null;
  }
  isSelected(q: MultipleChoice, idx: number) { return this.answers()[q.id] === idx; }
  isCorrectOption(q: MultipleChoice, idx: number) { return q.correctAnswerIndex === idx; }

  // TrueFalse
  selectedTF(q: TrueFalse): boolean | null {
    const a = this.answers()[q.id];
    return typeof a === 'boolean' ? a : null;
  }
  isTFSelected(q: TrueFalse, val: boolean) { return this.selectedTF(q) === val; }
  isTFCorrect(q: TrueFalse, val: boolean) { return q.answer === val; }
  isTFCorrectValue(q: TrueFalse, val: boolean) { return this.isTFCorrect(q, val); }

  // FillBlank
  fillUser(q: FillBlank): string { return String(this.answers()[q.id] ?? ''); }

  // Matching
  matchUserPermutation(q: Matching): number[] {
    const a = this.answers()[q.id];
    return Array.isArray(a) ? a : [];
  }
  matchRowCorrect(q: Matching, rowIndex: number): boolean {
    const perm = this.matchUserPermutation(q);
    return perm[rowIndex] === rowIndex;
  }
  matchIsFullyCorrect(q: Matching): boolean {
    const perm = this.matchUserPermutation(q);
    if (!Array.isArray(perm) || perm.length !== q.pairs.length) return false;
    return perm.every((v, i) => v === i);
  }


  // OpenEnded
  private escapeRe(s: string) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  openUserText(q: OpenEnded): string { return String(this.answers()[q.id] ?? ''); }
  openKeywordHit(q: OpenEnded, kw: string): boolean {
    const text = this.norm(this.openUserText(q));
    const key = this.norm(kw);
    if (!key) return false;
    const tokenLike = /^[\p{Letter}\p{Number}_]+$/u.test(key);
    if (tokenLike) {
      const re = new RegExp(
        `(?<=^|[^\\p{Letter}\\p{Number}_])${this.escapeRe(key)}(?=$|[^\\p{Letter}\\p{Number}_])`,
        'u'
      );
      return re.test(text);
    }
    return text.includes(key);
  }

}
