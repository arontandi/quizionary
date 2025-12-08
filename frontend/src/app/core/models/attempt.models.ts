export interface AttemptSummary {
    id: string;
    quizId: string;
    startedAt: string;
    completedAt: string;
    durationSec?: number;

    scorePct: number;
    correct: number;
    total: number;
}

export interface AttemptDetail extends AttemptSummary {
    answers: Record<string, any>;
    perQuestion: Array<{
        qid: string;
        type: string;
        earned: number;
        max: number;
        correct: boolean;
    }>;
}