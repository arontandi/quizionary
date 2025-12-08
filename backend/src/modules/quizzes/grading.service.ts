import { Injectable } from '@nestjs/common';

type GradeItem = {
    qid: string;
    type: string;
    earned: number;
    max: number;
    correct: boolean;
}

export type GradeResult = {
    perQuestion: GradeItem[];
    numCorrect: number;
    maxPoints: number;
    score: number;
}

@Injectable()
export class GradingService {
    private normStr(s: any) {
        return String(s ?? '').trim().toLowerCase();
    }

    private escapeRe(s: string): string {
        return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    private containsKeyword(textNorm: string, kwNorm): boolean {
        if (!kwNorm) return false;

        const tokenLike = /^[\p{Letter}\p{Number}_]+$/u.test(kwNorm);
        const safeKw = this.escapeRe(kwNorm);

        if (tokenLike) {
            const re = new RegExp(
                `(?<=^|[^\\p{Letter}\\p{Number}_])${safeKw}(?=$|[^\\p{Letter}\\p{Number}_])`,
                'u'
            );
            return re.test(textNorm);
        }

        return textNorm.includes(kwNorm);
    }

    gradeAnswers(questions: any[], answers: Record<string, any>) {
        const perQuestion = questions.map((q: any) => {
            const a = answers[q.id];
            const base = { qid: String(q.id), type: q.type as string };

            switch (q.type) {
                case 'multipleChoice': {
                    const correct = typeof a === 'number' && a === q.correctAnswerIndex;

                    return { ...base, earned: correct ? 1 : 0, max: 1, correct };
                }
                case 'trueFalse': {
                    const correct = typeof a === 'boolean' && a === Boolean(q.answer);

                    return { ...base, earned: correct ? 1 : 0, max: 1, correct };
                }
                case 'fillBlank': {
                    const given = this.normStr(a);
                    const expected = this.normStr(q.acceptableAnswer);
                    const correct = given.length > 0 && given === expected;

                    return { ...base, earned: correct ? 1 : 0, max: 1, correct };
                }
                case 'matching': {
                    const n = Array.isArray(q.pairs) ? q.pairs.length : 0;
                    const arr: number[] = Array.isArray(a) ? a : [];
                    const allValid = arr.length === n && arr.every(v => Number.isInteger(v) && v >= 0 && v < n);
                    const identity = allValid && arr.every((v, i) => v === i);

                    return { ...base, earned: identity ? 1 : 0, max: 1, correct: identity };
                }
                case 'openEnded': {
                    const textNorm = this.normStr(a);
                    const kws: string[] = Array.isArray(q.expectedKeywords) ? q.expectedKeywords : [];
                    const normKws = kws.map(k => this.normStr(k)).filter(k => k.length > 0);
                    const correct = textNorm.length > 0 && normKws.length > 0 && normKws.every(kw => this.containsKeyword(textNorm, kw));

                    return { ...base, earned: correct ? 1 : 0, max: 1, correct };
                }
                default:
                    return { ...base, earned: 0, max: 1, correct: false };
            }
        });

        const numQuestions = questions.length || 0;
        const totalEarned = perQuestion.reduce((s, r) => s + r.earned, 0);
        const numCorrect = totalEarned;
        const maxPoints = numQuestions;
        const score = numQuestions ? totalEarned / numQuestions : 0;

        return { perQuestion, numCorrect, maxPoints, score };
    }
}
