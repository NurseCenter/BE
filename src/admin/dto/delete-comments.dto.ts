import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { ECommentType } from 'src/users/enums';

export class DeleteCommentsDto {
  @IsNotEmpty()
  @IsEnum(ECommentType)
  @ApiProperty({ description: '댓글 종류 (댓글 혹은 답글)', example: 'reply' })
  type: ECommentType;

  @IsNumber()
  @ApiProperty({ description: '댓글 혹은 답글의 ID', example: '123' })
  commentId: number;
}
