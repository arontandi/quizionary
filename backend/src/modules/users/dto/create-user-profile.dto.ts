import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export interface CreateUserProfileInput {
    uid: string;
    email: string | null;
    displayName: string | null;
}

export class CreateUserProfileDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(30)
    displayName: string;
}