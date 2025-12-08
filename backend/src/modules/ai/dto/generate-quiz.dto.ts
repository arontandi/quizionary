import { IsOptional, IsString, MinLength } from "class-validator";

export class GenerateQuizFromTextDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsString()
    @MinLength(20)
    text!: string;
}

export type GenQ =
    | { type: 'multipleChoice'; questionText: string; answerExplanation?: string | null; data: { options: string[]; correctAnswerIndex: number } }
    | { type: 'trueFalse'; questionText: string; answerExplanation?: string | null; data: { answer: boolean } }
    | { type: 'fillBlank'; questionText: string; answerExplanation?: string | null; data: { acceptableAnswer: string } }
    | { type: 'matching'; questionText: string; answerExplanation?: string | null; data: { pairs: { left: string; right: string }[] } }
    | { type: 'openEnded'; questionText: string; answerExplanation?: string | null; data: { expectedKeywords: string[] } };

export type GenPayload = { title: string; description?: string; questions: GenQ[] };
