import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';
import { EMAIL_REGEX } from './Regex';
import { validationMessages } from '../interfaces/validation-messages';

export class FindPasswordDto {
  @ApiProperty({
    description: '회원 실명',
    example: '고길동',
  })
  @IsString()
  readonly username: string;

  @ApiProperty({
    description: '이메일 주소',
    example: 'gildong@example.com'
  })
  @IsString()
  @Matches(EMAIL_REGEX, { message: validationMessages.email })
  readonly email: string;
}
