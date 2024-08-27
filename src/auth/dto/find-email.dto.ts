import { IsString } from "class-validator";

export class FindEmailDto {
    @IsString()
    readonly username: string;

    @IsString()
    readonly phoneNumber: string;
}