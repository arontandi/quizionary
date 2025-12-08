export class AttemptSummaryDto {
  id!: string;
  quizId!: string;
  startedAt!: string;
  completedAt!: string;
  durationSec?: number;
  scorePct!: number;
  correct!: number;
  total!: number;
}

export type AttemptDetailDto = AttemptSummaryDto & {
  answers: Record<string, any>;
  perQuestion: Array<{
    qid: string;
    type: string;
    earned: number;
    max: number;
    correct: boolean;
  }>;
};