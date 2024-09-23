import { IsEnum, IsNotEmpty } from 'class-validator';
import { EReportStatus } from '../enum';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { GetOneReportedCommentDetailDto } from './get-one-reported-comment-detail.dto';

export class UpdateReportCommentStatusDto extends OmitType(GetOneReportedCommentDetailDto, ['commentId'] as const) {
  @IsNotEmpty()
  @IsEnum(EReportStatus)
  @ApiProperty({ description: '신고 처리 상태', enum: EReportStatus })
  status: EReportStatus;
}
