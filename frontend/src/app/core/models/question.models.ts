
export type QuestionType = 'multipleChoice' | 'trueFalse' | 'fillBlank' | 'matching' | 'openEnded';

export interface QuestionBase {
    id: string;
    type: QuestionType;
    questionText: string;
    explanation?: string;
}

export interface MultipleChoice extends QuestionBase {
    type: 'multipleChoice';
    options: string[];
    correctAnswerIndex: number;
}

export interface TrueFalse extends QuestionBase {
    type: 'trueFalse';
    answer: boolean;
}

export interface FillBlank extends QuestionBase {
    type: 'fillBlank';
    acceptableAnswer: string;
}

export interface MatchingPair { left: string; right: string; }
export interface Matching extends QuestionBase {
    type: 'matching';
    pairs: MatchingPair[];
}

export interface OpenEnded extends QuestionBase {
    type: 'openEnded';
    expectedKeywords: string[];
}

export type AnyQuestion = MultipleChoice | TrueFalse | FillBlank | Matching | OpenEnded;


export type CreateQuestionPayload =
    {
        questionText: string;
        answerExplanation?: string | null;
        type: 'multipleChoice';
        options: string[];
        correctAnswerIndex: number;
    }
    | {
        questionText: string;
        answerExplanation?: string | null;
        type: 'trueFalse';
        answer: boolean;
    }
    | {
        questionText: string;
        answerExplanation?: string | null;
        type: 'fillBlank';
        acceptableAnswer: string;
    }
    | {
        questionText: string;
        answerExplanation?: string | null;
        type: 'matching';
        pairs: MatchingPair[];
    }
    | {
        questionText: string;
        answerExplanation?: string | null;
        type: 'openEnded';
        expectedKeywords: string[];
    };