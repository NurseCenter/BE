import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { ECommentType } from 'src/users/enums';

export class GetOneReportedCommentDetailDto {
  @IsNotEmpty()
  @Type(() => Number)
  @ApiProperty({ description: '신고 테이블 고유 ID', example: 36 })
  reportId: number;

  @IsNotEmpty()
  @IsEnum(ECommentType)
  @ApiProperty({
    description: '댓글 또는 답글 타입',
    enum: ECommentType,
    example: ECommentType.COMMENT,
  })
  type: ECommentType;

  @IsNotEmpty()
  @IsOptional()
  @Type(() => Number)
  @ApiProperty({ description: '댓글 ID', example: 15 })
  commentId?: number;
}
