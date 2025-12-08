export type ServerQuestionType = 'multipleChoice' | 'trueFalse' | 'fillBlank' | 'matching' | 'openEnded';

export interface ServerMatchPair { left: string; right: string; }

export type ServerQuestionDTO =
    {
        id?: string;
        questionText: string;
        answerExplanation?: string;
        type: 'multipleChoice';
        options: string[];
        correctAnswerIndex: number;
    }
    | {
        id?: string;
        questionText: string;
        answerExplanation?: string;
        type: 'trueFalse';
        answer: boolean;
    }
    | {
        id?: string;
        questionText: string;
        answerExplanation?: string;
        type: 'fillBlank';
        acceptableAnswer: string;
    }
    | {
        id?: string;
        questionText: string;
        answerExplanation?: string;
        type: 'matching';
        pairs: ServerMatchPair[];
    }
    | {
        id?: string;
        questionText: string;
        answerExplanation?: string;
        type: 'openEnded';
        expectedKeywords: string[];
    }

export interface ServerQuizDTO {
    id?: string;
    title: string;
    description: string;
    createdBy: string;
    createdAt: string;
    questions?: ServerQuestionDTO[];
}
