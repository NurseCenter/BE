import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BaseReportedDto } from './base-reported-dto';

export class ReportedCommentDto extends BaseReportedDto {
  @IsNotEmpty()
  @ApiProperty({ description: '댓글 ID', example: 1 })
  commentId: number;
}
