import { IsString } from "class-validator";

export class FindPasswordDto {
    @IsString()
    readonly username: string;

    @IsString()
    readonly email: string;
}