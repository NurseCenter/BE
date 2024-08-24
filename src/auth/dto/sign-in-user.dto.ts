import { Matches } from "class-validator";
import { validationMessages } from "../interfaces/validation-messages";
import { EMAIL_REGEX, PASSWORD_REGEX } from './index'

export class SignInUserDto {
    @Matches(EMAIL_REGEX, { message : validationMessages.email })
    readonly email: string;

    @Matches(PASSWORD_REGEX, { message : validationMessages.password })
    readonly password: string;
}