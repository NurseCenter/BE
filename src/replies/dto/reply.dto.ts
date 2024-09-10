import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class ReplyDto {
  @ApiProperty({
    description: '댓글의 내용',
    example: '이것은 예시 댓글 내용입니다.', 
    minLength: 1, 
    maxLength: 300, 
  })
  @Length(1, 300)
  @IsString()
  content: string;
}