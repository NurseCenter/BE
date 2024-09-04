import { IsEnum, IsNumber, IsOptional, IsString, Length, MaxLength, maxLength } from 'class-validator';
import { BoardType } from '../enum/boardType.enum';
import { BasePostDto } from './base-post.dto';
import { EReportReason } from '../../admin/enums';
import { EReportStatus } from '../../admin/enums/report-status.enum';
import { IsNull } from 'typeorm';

export class ReportPostDto {
  @IsEnum(EReportReason)
  reportedReason: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  otherReportedReason?: string;
}
