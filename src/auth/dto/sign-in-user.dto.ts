import { Matches } from 'class-validator';
import { validationMessages } from '../interfaces/validation-messages';
import { EMAIL_REGEX, PASSWORD_REGEX } from './index';
import { ApiProperty } from '@nestjs/swagger';

export class SignInUserDto {
  @ApiProperty({
    description: '유효한 이메일 주소',
    example: 'user@example.com',
  })
  @Matches(EMAIL_REGEX, { message: validationMessages.email })
  readonly email: string;

  @ApiProperty({
    description: '8~16자 길이의 비밀번호로, 대문자, 소문자, 숫자, 특수 문자를 포함해야 함.',
    example: 'Password123!',
  })
  @Matches(PASSWORD_REGEX, { message: validationMessages.password })
  readonly password: string;
}
