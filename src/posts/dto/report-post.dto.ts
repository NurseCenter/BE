import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EReportReason } from 'src/reports/enum';

export class ReportPostDto {
  @IsEnum(EReportReason)
  @ApiProperty({ description: '댓글 내용' })
  @ApiProperty({ enum: EReportReason, description: '신고 이유' })
  reportedReason: EReportReason;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  @ApiProperty({ required: false, description: '기타 신고 이유', default: null })
  otherReportedReason: string = null;
}
