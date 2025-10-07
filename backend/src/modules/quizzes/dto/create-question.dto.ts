import { IsArray, IsNotEmpty, IsString, IsInt } from 'class-validator';

/*
    questionText: string;
    answerEplanation: string;
    type: 'multiple_choice';
    options?: string[];
    correctAnswerIndex?: number;
*/
export class CreateQuestionDto {
    @IsNotEmpty()
    @IsString()
    questionText: string;

    @IsString()
    answerExplanation?: string;

    @IsNotEmpty()
    @IsString()
    type: 'multiple_choice';

    @IsNotEmpty()
    @IsArray()
    @IsString({ each: true })
    options?: string[];

    @IsNotEmpty()
    @IsInt()
    correctAnswerIndex?: number;
}