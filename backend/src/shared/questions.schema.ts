import { QuestionType } from "./question-type.enum";

export interface BaseQuestion {
    id?: string;
    questionText: string;
    answerExplanation?: string;
    type: QuestionType;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
    type: QuestionType.MultipleChoice;
    options: string[];
    correctAnswerIndex: number;
}

export interface TrueFalseQuestion extends BaseQuestion {
    type: QuestionType.trueFalse;
    answer: boolean;
}

export interface FillBlankQuestion extends BaseQuestion {
    type: QuestionType.FillBlank;
    acceptableAnswer: string;
}

export interface MatchPair {
    left: string;
    right: string;
}

export interface MatchingQuestion extends BaseQuestion {
    type: QuestionType.Matching;
    pairs: MatchPair[];
}

export interface OpenEndedQuestion extends BaseQuestion {
    type: QuestionType.OpenEnded;
    expectedKeywords: string[];
}

export type Question = MultipleChoiceQuestion | TrueFalseQuestion | FillBlankQuestion | MatchingQuestion | OpenEndedQuestion;