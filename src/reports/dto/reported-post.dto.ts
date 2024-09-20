import { IsNotEmpty } from 'class-validator';
import { EReportReason, EReportStatus } from '../enum';

export class ReportedPostDto {
  @IsNotEmpty()
  postId: number;

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
