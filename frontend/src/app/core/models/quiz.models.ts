import { AnyQuestion, CreateQuestionPayload } from "./question.models";


export interface Quiz {
    id: string;
    title: string;
    description: string;
    createdBy: string;
    createdAt: string;
    questions: AnyQuestion[];
}

export type CreateQuizPayload = {
    title: string;
    description: string;
    questions: CreateQuestionPayload[];
}

export type RecentQuizActivity = {
  quizId: string;
  title: string;
  lastAttemptCompletedAt: string;
  scorePct: number | null;
  correct: number | null;
  total: number | null;
};