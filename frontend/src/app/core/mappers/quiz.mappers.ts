import { AnyQuestion } from "../models/question.models";
import { Quiz } from "../models/quiz.models";
import { ServerQuestionDTO, ServerQuizDTO } from "../models/server-dto";

export function mapServerQuestionToClient(question: ServerQuestionDTO): AnyQuestion {
    const id = question.id ?? cryptoRandomId();

    switch (question.type) {
        case 'multipleChoice':
            return {
                id,
                type: 'multipleChoice',
                questionText: question.questionText,
                explanation: question.answerExplanation,
                options: question.options ?? [],
                correctAnswerIndex: question.correctAnswerIndex ?? -1,
            };
        case 'trueFalse':
            return {
                id,
                type: 'trueFalse',
                questionText: question.questionText,
                explanation: question.answerExplanation,
                answer: question.answer,
            };
        case 'fillBlank':
            return {
                id,
                type: 'fillBlank',
                questionText: question.questionText,
                explanation: question.answerExplanation,
                acceptableAnswer: question.acceptableAnswer,
            };
        case 'matching':
            return {
                id,
                type: 'matching',
                questionText: question.questionText,
                explanation: question.answerExplanation,
                pairs: (question.pairs ?? []).map(p => ({ left: String(p.left), right: String(p.right) })),
            };
        case 'openEnded':
            return {
                id,
                type: 'openEnded',
                questionText: question.questionText,
                explanation: question.answerExplanation,
                expectedKeywords: question.expectedKeywords,
            };
    }
}

export function mapServerQuizToClient(quiz: ServerQuizDTO): Quiz {
    return {
        id: quiz.id ?? cryptoRandomId(),
        title: quiz.title,
        description: quiz.description,
        createdBy: quiz.createdBy,
        createdAt: quiz.createdAt,
        questions: (quiz.questions ?? []).map(mapServerQuestionToClient),
    };
}

function cryptoRandomId() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}