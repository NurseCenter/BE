import { Matches } from "class-validator";
import { validationMessages } from "../interfaces/validation-messages";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*?_]).{8,16}$/;

export class SignInUserDto {
    @Matches(EMAIL_REGEX, { message : validationMessages.email })
    readonly email: string;

    @Matches(PASSWORD_REGEX, { message : validationMessages.password })
    readonly password: string;
}