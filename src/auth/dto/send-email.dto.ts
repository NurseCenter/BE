import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { validationMessages } from '../interfaces/validation-messages';
import { EMAIL_REGEX, NICKNAME_REGEX } from './Regex';
import { ApiProperty } from '@nestjs/swagger';

export class SendEmailDto {
  @ApiProperty({
    description: '2~8자의 영문 대소문자 또는 한글 닉네임',
    example: '홍길동'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(NICKNAME_REGEX, { message: '닉네임은 2~8자의 영문 대소문자 또는 한글이어야 합니다.' })
  readonly nickname: string;

  @ApiProperty({
    description: '유효한 이메일 주소',
    example: 'example@domain.com'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(EMAIL_REGEX, { message: validationMessages.email })
  readonly email: string;

  @ApiProperty({
    description: '이메일 인증 링크',
    example: 'https://www.cau-gannies.com/email-verification/verify?token=abc123',
  })
  @IsString()
  @IsNotEmpty()
  readonly emailVerificationLink: string;
}
