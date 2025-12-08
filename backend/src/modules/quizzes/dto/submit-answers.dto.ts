import { IsISO8601, IsNotEmptyObject, IsObject, IsOptional } from "class-validator";

export class submitAnswersDto {
    @IsObject()
    @IsNotEmptyObject()
    answers!: Record<string, any>;

    @IsOptional()
    @IsISO8601()
    startedAt?: string;

    @IsOptional()
    @IsISO8601()
    completedAt?: string;
}