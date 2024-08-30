import { IsNotEmpty, IsString } from "class-validator";

export class VerifyPhoneNumberDto {
    @IsString()
    @IsNotEmpty()
    phoneNumber: string;

    @IsString()
    @IsNotEmpty()
    code: string;
}