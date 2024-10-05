import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { validationMessages } from '../interfaces/validation-messages';
import { EMAIL_REGEX } from './Regex';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({
    description: '유효한 이메일 주소',
    example: 'example@domain.com',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(EMAIL_REGEX, { message: validationMessages.email })
  email: string;
}
