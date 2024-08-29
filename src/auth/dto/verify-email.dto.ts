import { IsNotEmpty, IsString, Matches } from "class-validator";
import { validationMessages } from "../interfaces/validation-messages";
import { EMAIL_REGEX } from "./Regex";

export class VerifyEmailDto {
    @IsString()
    @IsNotEmpty()
    @Matches(EMAIL_REGEX, { message: validationMessages.email })
    email: string;
}