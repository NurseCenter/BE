import { IsNotEmpty } from 'class-validator';
import { EReportReason, EReportStatus } from '../enum';

export class ReportedCommentDto {
  @IsNotEmpty()
  commentId: number;

  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  reportedUserId: number;

  @IsNotEmpty()
  reportedReason: EReportReason;

  @IsNotEmpty()
  otherReportedReason: string;

  @IsNotEmpty()
  status: EReportStatus;
}
