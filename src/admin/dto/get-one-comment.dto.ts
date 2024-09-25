import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ECommentType } from 'src/users/enums';

export class GetOneCommentDto {
  @IsNotEmpty()
  @IsEnum(ECommentType)
  @ApiProperty({
    description: '댓글 또는 답글 타입',
    enum: ECommentType,
    example: ECommentType.COMMENT,
  })
  type: ECommentType;

  @IsNotEmpty()
  @Type(() => Number)
  @ApiProperty({ description: '댓글 ID', example: 15 })
  commentId: number;
}
