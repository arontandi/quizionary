export interface Question {
    id?: string;
    questionText: string;
    answerExplanation?: string;
    type: 'multiple_choice';
    options?: string[];
    correctAnswerIndex?: number;
}