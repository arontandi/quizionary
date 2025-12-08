import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString, IsInt, IsOptional, IsEnum, ValidateIf, ArrayMinSize, Min, IsBoolean, ValidateNested } from 'class-validator';
import { QuestionType } from 'src/shared/question-type.enum';

class MatchPairDto {
    @IsString()
    @IsNotEmpty()
    left!: string;

    @IsString()
    @IsNotEmpty()
    right!: string;
}

export class CreateQuestionDto {
    @IsNotEmpty()
    @IsString()
    questionText: string;

    @IsOptional()
    @IsString()
    answerExplanation?: string;

    @IsEnum(QuestionType)
    type!: QuestionType;

    @ValidateIf(o => o.type === QuestionType.MultipleChoice)
    @IsArray()
    @ArrayMinSize(2)
    @IsString({ each: true })
    options?: string[];

    @ValidateIf(o => o.type === QuestionType.MultipleChoice)
    @IsInt()
    @Min(0)
    correctAnswerIndex?: number;

    @ValidateIf(o => o.type === QuestionType.trueFalse)
    @IsBoolean()
    answer?: boolean;

    @ValidateIf(o => o.type === QuestionType.FillBlank)
    @IsString()
    @IsNotEmpty()
    acceptableAnswer?: string;

    @ValidateIf(o => o.type === QuestionType.Matching)
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => MatchPairDto)
    pairs?: MatchPairDto[];

    @ValidateIf(o => o.type === QuestionType.OpenEnded)
    @IsArray()
    @ArrayMinSize(1)
    @IsString({ each: true })
    expectedKeywords?: string[];
}
