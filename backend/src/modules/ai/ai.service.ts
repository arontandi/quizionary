import { BadRequestException, Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { GenPayload } from './dto/generate-quiz.dto';
import { QuizzesService } from '../quizzes/quizzes.service';
import { ConfigService } from '@nestjs/config';
import { extractWithPdfJs } from './utils/pdf-extract';
import { mapAiQToCreateDto } from './mappers/ai-q-to-create.mappers';

const MODEL = 'gpt-4.1-mini';

@Injectable()
export class AiService {
    private openai;
    constructor(private quizzes: QuizzesService, private cfg: ConfigService) {
        const apiKey = this.cfg.get<string>('OPENAI_API_KEY');
        this.openai = new OpenAI({ apiKey });
    }

    async generateAndCreate(userId: string, text: string) {
        const g = await this.generateQuiz(text);
        const mappedQuestions = g.questions.map(q => mapAiQToCreateDto(q));
        const { quiz } = await this.quizzes.createQuizWithQuestions({
            title: g.title,
            description: g.description ?? '',
            createdBy: userId,
            createdAt: new Date().toISOString()
        } as any,
            mappedQuestions as any
        );
        return quiz;
    }

    async generateAndCreateFromPdf(userId: string, file: Express.Multer.File) {
        const text = await this.parsePdf(file);
        return this.generateAndCreate(userId, text);
    }

    async parsePdf(file: Express.Multer.File): Promise<string> {
        if (!file) throw new BadRequestException('Missing PDF file.');
        if (file.mimetype !== 'application/pdf') throw new BadRequestException('File must be a PDF.');

        const text = await extractWithPdfJs(file.buffer);
        const norm = this.normalize(text);
        if (norm.length < 50) throw new BadRequestException('No extractable text found in PDF.');
        return norm;

    }

    private async generateQuiz(text: string): Promise<GenPayload> {
        const messages = [
            { role: 'system' as const, content: 'You generate strict JSON for quizzes. Output ONLY valid JSON.' },
            { role: 'user' as const, content: this.buildPrompt(text) }
        ];

        const res = await this.openai.chat.completions.create({
            model: MODEL, temperature: 0.2, max_tokens: 2000, messages,
        });

        const raw = res.choices[0]?.message?.content ?? '{}';
        const obj = this.safeParseJson(raw) as Partial<GenPayload>;

        if (!obj || typeof obj !== 'object' || !obj.title || !Array.isArray(obj.questions)) {
            throw new BadRequestException('Model returned invalid quiz JSON.');
        }

        return {
            title: obj.title,
            description: obj.description ?? '',
            questions: obj.questions
        }
    }

    private normalize(s: string) {
        return s
            .replace(/\r/g, '')
            .replace(/[ \t]+\n/g, '\n')
            .replace(/-\n/g, '')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    private safeParseJson(raw: string) {
        const t = raw.trim();
        const noFences = t.startsWith('```')
            ? t.replace(/^```json|^```/i, '').replace(/```$/, '').trim()
            : t;

        try {
            return JSON.parse(noFences);
        } catch {
            const s = noFences.indexOf('{');
            const e = noFences.lastIndexOf('}');
            if (s >= 0 && e > s) return JSON.parse(noFences.slice(s, e + 1));
            throw new BadRequestException('Model output was not valid JSON.');
        }
    }


    private buildPrompt(text?: string) {
        return `
Return ONLY JSON with this shape:

{
  "title": string,
  "description": string,
  "questions": Array<
    | { "type": "multipleChoice", "questionText": string, "answerExplanation"?: string,
        "data": { "options": [string, string, string, string], "correctAnswerIndex": number } }
    | { "type": "trueFalse", "questionText": string, "answerExplanation"?: string,
        "data": { "answer": boolean } }
    | { "type": "fillBlank", "questionText": string, "answerExplanation"?: string,
        "data": { "acceptableAnswer": string } }
    | { "type": "matching", "questionText": string, "answerExplanation"?: string,
        "data": { "pairs": Array<{ "left": string, "right": string }> } }
    | { "type": "openEnded", "questionText": string, "answerExplanation"?: string,
        "data": { "expectedKeywords": string[] } }
  ]
}

Rules:
- 10–15 questions, mixed types.
- MCQ: exactly 4 options, 0-based correctAnswerIndex.
- Matching: 4–6 pairs.
- Keep language consistent with the source (HU→HU, EN→EN).
- Make the title short and concise.

Hints:
Title: (infer)
Description: (infer)
Source:
${(text || '').slice(0, 12000)}
`.trim();
    }
}
