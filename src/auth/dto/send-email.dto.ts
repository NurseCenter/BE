import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { validationMessages } from '../interfaces/validation-messages';
import { EMAIL_REGEX } from './Regex';

export class SendEmailDto {
  @IsString()
  @IsNotEmpty()
  readonly nickname: string;

  @IsString()
  @IsNotEmpty()
  @Matches(EMAIL_REGEX, { message: validationMessages.email })
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  readonly emailVerificationLink: string;
}
