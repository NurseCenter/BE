import { IsEnum, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EReportReason } from 'src/reports/enum';

export class ReportDto {
  @IsEnum(EReportReason)
  @ApiProperty({ enum: EReportReason, description: '신고 이유 (목록 중 선택)' })
  reportedReason: EReportReason;

  @IsString()
  @MaxLength(100)
  @ApiProperty({ required: false, description: '기타 신고 이유, 100자 이내로 작성', default: null })
  otherReportedReason: string = null;
}
