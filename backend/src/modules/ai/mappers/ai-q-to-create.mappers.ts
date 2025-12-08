import { GenQ } from "../dto/generate-quiz.dto";

export function mapAiQToCreateDto(q: GenQ) {
    const typeMap: Record<string, string> = {
        multipleChoice: 'multipleChoice',
        trueFalse: 'trueFalse',
        fillBlank: 'fillBlank',
        matching: 'matching',
        openEnded: 'openEnded',
    };

    const base = {
        questionText: q.questionText,
        answerExplanation: q.answerExplanation ?? undefined,
        type: typeMap[q.type] ?? q.type,
    }

    switch (q.type) {
        case 'multipleChoice':
            return { ...base, options: q.data.options, correctAnswerIndex: q.data.correctAnswerIndex };
        case 'trueFalse':
            return { ...base, answer: q.data.answer };
        case 'fillBlank':
            return { ...base, acceptableAnswer: q.data.acceptableAnswer };
        case 'matching':
            return { ...base, pairs: q.data.pairs };
        case 'openEnded':
            return { ...base, expectedKeywords: q.data.expectedKeywords };
        default:
            return base as any;
    }
}