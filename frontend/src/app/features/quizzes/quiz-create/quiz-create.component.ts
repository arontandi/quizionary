import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/core/services/api.service';
import { CreateQuizPayload } from 'src/app/core/models/quiz.models';
import { CommonModule } from '@angular/common';
import { CreateQuestionPayload } from 'src/app/core/models/question.models';

type LocalQuestionType = 'multipleChoice' | 'trueFalse' | 'fillBlank' | 'matching' | 'openEnded';

type QuestionForm = FormGroup<{
  type: FormControl<LocalQuestionType>;
  questionText: FormControl<string>;
  answerExplanation: FormControl<string | null>;
  data: FormGroup;
}>;

function asMCQData(data: AbstractControl) {
  return data as FormGroup<{
    options: FormArray<FormControl<string>>;
    correctAnswerIndex: FormControl<number | null>;
  }>;
}

function asTFData(data: AbstractControl) {
  return data as FormGroup<{ answer: FormControl<boolean> }>;
}

function asFillData(data: AbstractControl) {
  return data as FormGroup<{ acceptableAnswer: FormControl<string> }>;
}

function asMatchData(data: AbstractControl) {
  return data as FormGroup<{
    pairs: FormArray<FormGroup<{ left: FormControl<string>; right: FormControl<string> }>>;
  }>;
}

function asOpenEndedData(data: AbstractControl) {
  return data as FormGroup<{ expectedKeywords: FormArray<FormControl<string>> }>;
}

const TYPE_BUILDERS: Record<LocalQuestionType, (fb: FormBuilder) => FormGroup> = {
  multipleChoice: (fb) =>
    fb.group({
      options: fb.array<FormControl<string>>([
        fb.control('', { nonNullable: true, validators: [Validators.required] }),
        fb.control('', { nonNullable: true, validators: [Validators.required] }),
      ]),
      correctAnswerIndex: fb.control<number | null>(0, { validators: [Validators.required] }),
    }),

  trueFalse: (fb) =>
    fb.group({
      answer: fb.control(true, { nonNullable: true }),
    }),

  fillBlank: (fb) =>
    fb.group({
      acceptableAnswer: fb.control('', { nonNullable: true, validators: [Validators.required] }),
    }),

  matching: (fb) =>
    fb.group({
      pairs: fb.array<FormGroup<{ left: FormControl<string>; right: FormControl<string> }>>([
        fb.group({
          left: fb.control('', { nonNullable: true, validators: [Validators.required] }),
          right: fb.control('', { nonNullable: true, validators: [Validators.required] }),
        }),
      ]),
    }),

  openEnded: (fb) =>
    fb.group({
      expectedKeywords: fb.array<FormControl<string>>([
        fb.control('', { nonNullable: true, validators: [Validators.required] }),
      ]),
    }),
};

function createQuestionForm(fb: FormBuilder, type: LocalQuestionType): QuestionForm {
  return fb.group({
    type: fb.control<LocalQuestionType>(type, { nonNullable: true }),
    questionText: fb.control('', { nonNullable: true, validators: [Validators.required] }),
    answerExplanation: fb.control<string | null>(null),
    data: TYPE_BUILDERS[type](fb),
  });
}

@Component({
  standalone: true,
  selector: 'app-quiz-create',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './quiz-create.component.html',
  styleUrl: './quiz-create.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuizCreateComponent {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private router = inject(Router);

  readonly posting = signal(false);

  form = this.fb.group({
    title: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
    description: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
    questions: this.fb.array<QuestionForm>([]),
  });

  get questions() { return this.form.get('questions') as FormArray<QuestionForm>; }

  constructor() { this.addQuestion('multipleChoice'); }

  addQuestion(type: LocalQuestionType = 'multipleChoice') {
    this.questions.push(createQuestionForm(this.fb, type));
  }

  removeQuestion(i: number) { this.questions.removeAt(i); }

  onTypeChange(qIndex: number, newType: LocalQuestionType) {
    const q = this.questions.at(qIndex);
    if (!q) return;
    q.patchValue({ type: newType });
    q.setControl('data', TYPE_BUILDERS[newType](this.fb));
  }

  addOption(qIndex: number) {
    const q = this.questions.at(qIndex);
    if (!q || q.controls.type.value !== 'multipleChoice') return;
    const data = asMCQData(q.controls.data);
    data.controls.options.push(this.fb.control('', { nonNullable: true, validators: [Validators.required] }));
    if (data.controls.correctAnswerIndex.value === null) data.controls.correctAnswerIndex.setValue(0);
  }

  removeOption(qIndex: number, optIndex: number) {
    const q = this.questions.at(qIndex);
    if (!q || q.controls.type.value !== 'multipleChoice') return;
    const data = asMCQData(q.controls.data);
    const options = data.controls.options;
    const correct = data.controls.correctAnswerIndex;

    options.removeAt(optIndex);

    if (options.length < 2) {
      correct.setValue(options.length ? 0 : null);
    } else {
      const prev = correct.value ?? 0;
      if (prev === optIndex) correct.setValue(0);
      else if (prev !== null && optIndex < prev) correct.setValue(prev - 1);
    }
  }

  setCorrect(qIndex: number, optIndex: number) {
    const q = this.questions.at(qIndex);
    if (!q || q.controls.type.value !== 'multipleChoice') return;
    asMCQData(q.controls.data).controls.correctAnswerIndex.setValue(optIndex);
  }

  addPair(qIndex: number) {
    const q = this.questions.at(qIndex);
    if (!q || q.controls.type.value !== 'matching') return;
    asMatchData(q.controls.data).controls.pairs.push(
      this.fb.group({
        left: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
        right: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
      })
    );
  }

  removePair(qIndex: number, pairIndex: number) {
    const q = this.questions.at(qIndex);
    if (!q || q.controls.type.value !== 'matching') return;
    asMatchData(q.controls.data).controls.pairs.removeAt(pairIndex);
  }

  keywordControls(qIndex: number) {
    const q = this.questions.at(qIndex);
    if (!q || q.controls.type.value !== 'openEnded') return [];
    return asOpenEndedData(q.controls.data).controls.expectedKeywords.controls;
  }

  addKeyword(qIndex: number) {
    const q = this.questions.at(qIndex);
    if (!q || q.controls.type.value !== 'openEnded') return;
    const keywords = asOpenEndedData(q.controls.data).controls.expectedKeywords;
    keywords.push(this.fb.control('', { nonNullable: true, validators: [Validators.required] }));
  }

  removeKeyword(qIndex: number, rIndex: number) {
    const q = this.questions.at(qIndex);
    if (!q || q.controls.type.value !== 'openEnded') return;
    asOpenEndedData(q.controls.data).controls.expectedKeywords.removeAt(rIndex);
  }

  private isQuestionValid(q: QuestionForm): boolean {
    if (q.controls.questionText.invalid) return false;

    switch (q.controls.type.value) {
      case 'multipleChoice': {
        const data = asMCQData(q.controls.data);
        const options = data.controls.options.value;
        const correct = data.controls.correctAnswerIndex.value;
        if (!options || options.length < 2) return false;
        if (options.some(o => !o || !o.trim())) return false;
        return correct !== null && correct >= 0 && correct < options.length;
      }
      case 'trueFalse': {
        const data = asTFData(q.controls.data);
        return typeof data.controls.answer.value === 'boolean';
      }
      case 'fillBlank': {
        const data = asFillData(q.controls.data);
        const answer = (data.controls.acceptableAnswer.value ?? '').trim();
        return answer.length > 0;
      }
      case 'matching': {
        const data = asMatchData(q.controls.data);
        const pairs = data.controls.pairs.controls;
        if (pairs.length === 0) return false;
        return pairs.every((p) => p.controls.left.value.trim() && p.controls.right.value.trim());
      }
      case 'openEnded': {
        const arr = asOpenEndedData(q.controls.data).controls.expectedKeywords.value;
        return Array.isArray(arr) && arr.length > 0 && arr.every(k => (k ?? '').trim().length > 0);
      }
    }
  }

  formValid(): boolean {
    if (this.form.controls.title.invalid || this.form.controls.description.invalid) return false;
    if (this.questions.length === 0) return false;
    return this.questions.controls.every(q => this.isQuestionValid(q));
  }

  submit() {
    if (!this.formValid()) {
      this.form.markAllAsTouched();
      return;
    }

    const questions: CreateQuestionPayload[] = this.questions.controls.map(q => {
      const explanation = (q.controls.answerExplanation.value ?? '').trim() || null;
      const common = {
        questionText: q.controls.questionText.value!,
        answerExplanation: explanation,
      };

      switch (q.controls.type.value) {
        case 'multipleChoice': {
          const data = asMCQData(q.controls.data);
          return {
            ...common,
            type: 'multipleChoice',
            options: data.controls.options.value.map(o => o.trim()),
            correctAnswerIndex: data.controls.correctAnswerIndex.value ?? 0,
          };
        }
        case 'trueFalse': {
          const data = asTFData(q.controls.data);
          return {
            ...common,
            type: 'trueFalse',
            answer: data.controls.answer.value,
          }
        }
        case 'fillBlank': {
          const data = asFillData(q.controls.data);
          return {
            ...common,
            type: 'fillBlank',
            acceptableAnswer: data.controls.acceptableAnswer.value.trim(),
          }
        }
        case 'matching': {
          const data = asMatchData(q.controls.data);
          return {
            ...common,
            type: 'matching',
            pairs: data.controls.pairs.value.map(p => ({
              left: (p.left ?? '').trim(),
              right: (p.right ?? '').trim(),
            })),
          }
        }
        case 'openEnded': {
          const data = asOpenEndedData(q.controls.data);
          return {
            ...common,
            type: 'openEnded',
            expectedKeywords: data.controls.expectedKeywords.value.map(k => (k ?? '').trim()).filter(k => k.length > 0),
          }
        }
      }
    });

    const payload: CreateQuizPayload = {
      title: this.form.controls.title.value!,
      description: this.form.controls.description.value!,
      questions,
    };

    this.posting.set(true);
    this.api.createQuiz(payload).subscribe({
      next: (res) => {
        this.posting.set(false);
        this.router.navigate(['/quiz', res.id]);
      },
      error: (err) => {
        console.error(err);
        this.posting.set(false);
        alert('Failed to create quiz.');
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  optionsControls(i: number) {
    const q = this.questions.at(i);
    if (!q || q.controls.type.value !== 'multipleChoice') return [];
    return asMCQData(q.controls.data).controls.options.controls;
  }

  pairsControls(i: number) {
    const q = this.questions.at(i);
    if (!q || q.controls.type.value !== 'matching') return [];
    return asMatchData(q.controls.data).controls.pairs.controls;
  }

  isCorrect(i: number, oi: number) {
    const q = this.questions.at(i);
    if (!q || q.controls.type.value !== 'multipleChoice') return false;
    return asMCQData(q.controls.data).controls.correctAnswerIndex.value === oi;
  }
}
