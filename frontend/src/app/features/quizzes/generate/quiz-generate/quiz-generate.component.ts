import { CommonModule, NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';

type SourceMode = 'text' | 'pdf';

@Component({
  standalone: true,
  selector: 'app-quiz-generate',
  imports: [FormsModule, NgIf, CommonModule],
  templateUrl: './quiz-generate.component.html',
  styleUrl: './quiz-generate.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuizGenerateComponent {
  constructor(private api: ApiService, private router: Router) { }

  mode = signal<SourceMode>('text');
  loading = signal(false);
  posting = signal(false);
  errorMsg = signal('');
  pdfName = signal<string | null>(null);
  sourceText = signal('');
  private pdfFile = signal<File | null>(null);

  canGenerate = computed(() => {
    if (this.mode() === 'text') return this.sourceText().trim().length >= 20;
    return !!this.pdfFile;
  });

  setMode(m: SourceMode) {
    this.mode.set(m);
    this.errorMsg.set('');
  }

  onPdfChosen(file: File | null) {
    this.pdfFile.set(file);
    this.pdfName.set(file ? file.name : null);
  }

  async generateAndCreate() {
    if (!this.canGenerate() || this.loading()) return;
    this.errorMsg.set('');
    this.loading.set(true);

    try {
      let created: any;

      if (this.mode() === 'text') {
        created = await firstValueFrom(this.api.generateQuizFromText(this.sourceText()));
      } else {
        const file = this.pdfFile();
        if (!file) throw new Error('No PDF selected.');
        created = await firstValueFrom(this.api.generateQuizFromPdf(file));
      }

      if (!created?.id) throw new Error('Quiz was not generated');
      this.router.navigate(['/quiz', created.id]);
    } catch (e: any) {
      console.error(e);
      const msg =
        e instanceof HttpErrorResponse
          ? (e.error?.message || e.statusText || `HTTP ${e.status}`)
          : (e?.message || 'Unknown error');
      this.errorMsg.set(`Failed to generate quiz: ${msg}`);
    } finally {
      this.loading.set(false);
    }
  }

  goBack() {
    history.back();
  }

}
