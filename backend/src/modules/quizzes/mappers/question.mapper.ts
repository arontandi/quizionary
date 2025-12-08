import { MatchPair, Question } from "src/shared/questions.schema";
import { CreateQuestionDto } from "../dto/create-question.dto";
import { QuestionType } from "src/shared/question-type.enum";

export function mapCreateDtoToQuestion(dto: CreateQuestionDto): Question {
    switch (dto.type) {
        case QuestionType.MultipleChoice:
            return {
                type: QuestionType.MultipleChoice,
                questionText: dto.questionText,
                answerExplanation: dto.answerExplanation,
                options: dto.options!,
                correctAnswerIndex: dto.correctAnswerIndex!,
            };

        case QuestionType.trueFalse:
            return {
                type: QuestionType.trueFalse,
                questionText: dto.questionText,
                answerExplanation: dto.answerExplanation,
                answer: dto.answer!,
            };

        case QuestionType.FillBlank:
            return {
                type: QuestionType.FillBlank,
                questionText: dto.questionText,
                answerExplanation: dto.answerExplanation,
                acceptableAnswer: dto.acceptableAnswer!,
            };

        case QuestionType.Matching:
            return {
                type: QuestionType.Matching,
                questionText: dto.questionText,
                answerExplanation: dto.answerExplanation,
                pairs: (dto.pairs ?? []).map(p => ({ left: String(p.left), right: String(p.right) })),
            };

        case QuestionType.OpenEnded:
            return {
                type: QuestionType.OpenEnded,
                questionText: dto.questionText,
                answerExplanation: dto.answerExplanation,
                expectedKeywords: dto.expectedKeywords!,
            };

        default:
            throw new Error(`Unsupported question type: ${dto.type}`);
    }
}