import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class CreateReplyDto {
  @ApiProperty({
    description: '답글의 내용',
    example: '이것은 예시 답글 내용입니다.',
    minLength: 1,
    maxLength: 300,
  })
  @Length(1, 300)
  @IsString()
  content: string;
}
