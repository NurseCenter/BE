import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

// 댓글 최대 300자
export class CreateCommentDto {
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
