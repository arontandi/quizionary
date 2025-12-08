import { NgFor, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AnyQuestion, FillBlank, Matching, MultipleChoice, OpenEnded, TrueFalse } from 'src/app/core/models/question.models';
import { Quiz } from 'src/app/core/models/quiz.models';
import { ApiService } from 'src/app/core/services/api.service';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

type MatchVMItem = { text: string; originalIndex: number };
type MatchVM = { right: MatchVMItem[] };

@Component({
  standalone: true,
  selector: 'app-quiz-take',
  imports: [FormsModule, NgIf, NgFor, NgSwitch, NgSwitchCase, DragDropModule],
  templateUrl: './quiz-take.component.html',
  styleUrl: './quiz-take.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
})
export class QuizTakeComponent {
  quiz = signal<Quiz | null>(null);
  answers: Record<string, any> = {};
  msg = signal('');
  private matchStateMap = new Map<string, MatchVM>();
  currentTime = '';

  constructor(private route: ActivatedRoute, private api: ApiService, private router: Router) { }

  ngOnInit() {
    this.currentTime = new Date().toISOString().toString();
    const id = this.route.snapshot.paramMap.get('id')!;
    this.api.getQuiz(id).subscribe(q => {
      this.quiz.set(q);
      q.questions.forEach((qq: AnyQuestion) => {
        switch (qq.type) {
          case 'matching':
            this.answers[qq.id] = Array(qq.pairs.length).fill(null);
            break;
          case 'multipleChoice':
          case 'trueFalse':
          case 'fillBlank':
          case 'openEnded':
          default:
            break;
        }
      });
    });
  }

  submit() {
    const id = this.quiz()!.id;
    this.api.submitAnswers(id, this.answers, this.currentTime).subscribe({
      next: (res) => {
        this.router.navigate(['/quiz', res.quizId, 'attempts', res.id]);
      },
      error: () => this.msg.set('Could not submit. Try again.')
    })
  }

  abortAttempt() {
    const ok = confirm('Abort this attempt and go back to the quiz page? Your answers will be lost.');
    if (!ok) return;
    this.router.navigate(['/quiz', this.quiz()!.id]);
  }

  trackById = (_: number, q: { id: string | number }) => q.id;
  trackByIndex = (_: number, __: unknown) => _;

  isMCQ(q: AnyQuestion): q is MultipleChoice { return q.type === 'multipleChoice' }
  isTF(q: AnyQuestion): q is TrueFalse { return q.type === 'trueFalse' }
  isFill(q: AnyQuestion): q is FillBlank { return q.type === 'fillBlank' }
  isMatch(q: AnyQuestion): q is Matching { return q.type === 'matching' }
  isOpen(q: AnyQuestion): q is OpenEnded { return q.type === 'openEnded' }

  private isAnswered(q: AnyQuestion): boolean {
    const a = this.answers[q.id];
    switch (q.type) {
      case 'multipleChoice':
        return typeof a === 'number' && a >= 0;
      case 'trueFalse':
        return typeof a === 'boolean';
      case 'fillBlank':
        return typeof a === 'string' && a.trim().length > 0;
      case 'matching':
        return Array.isArray(a) && a.length === q.pairs.length && a.every((v: any) => typeof v === 'number' && v >= 0 && v < q.pairs.length);
      case 'openEnded':
        return typeof a === 'string' && a.trim().length > 0;
    }
  }

  mcqOptions(q: AnyQuestion): string[] {
    return this.isMCQ(q) ? q.options : [];
  }
  matchPairs(q: AnyQuestion): { left: string; right: string }[] {
    return this.isMatch(q) ? q.pairs : [];
  }

  allAnswered(): boolean {
    const qs = this.quiz()?.questions ?? [];
    return qs.length > 0 && this.answeredCount() === qs.length;
  }

  answeredCount(): number {
    const qs = this.quiz()?.questions ?? [];
    return qs.reduce((acc, q) => acc + (this.isAnswered(q) ? 1 : 0), 0);
  }

  completionPct(): number {
    const total = this.quiz()?.questions.length ?? 0;
    if (!total) return 0;
    return Math.round((this.answeredCount() / total) * 100);
  }

  matchState(q: AnyQuestion): MatchVM {
    return this.isMatch(q) ? this.ensureMatchState(q) : { right: [] };
  }

  onDropMatch(q: Matching, ev: CdkDragDrop<MatchVMItem[]>) {
    const vm = this.ensureMatchState(q);
    moveItemInArray(vm.right, ev.previousIndex, ev.currentIndex);
    this.answers[q.id] = vm.right.map(item => item.originalIndex);
  }

  private shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  private ensureMatchState(q: Matching): MatchVM {
    let vm = this.matchStateMap.get(q.id);
    if (!vm) {
      const rightItems: MatchVMItem[] = q.pairs.map((p, idx) => ({ text: p.right, originalIndex: idx }));
      const shuffled = this.shuffle(rightItems);
      vm = { right: shuffled };
      this.matchStateMap.set(q.id, vm);
      this.answers[q.id] = vm.right.map(item => item.originalIndex);
    }
    return vm;
  }

  hoveredIndex: number | null = null;
  setHover(i: number | null) { this.hoveredIndex = i; }

}