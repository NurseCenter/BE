import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ description: '댓글 내용' })
  @Length(1, 1000)
  @IsString()
  content: string;
}
