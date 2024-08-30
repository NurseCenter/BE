import { IsString, IsNotEmpty } from "class-validator";

export class SendPhoneVerificationDto {
    @IsString()
    @IsNotEmpty()
    phoneNumber: string;
}