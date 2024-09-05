import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ESuspensionReason } from '../../admin/enums';
import { ApiProperty } from '@nestjs/swagger';

export class ReportPostDto {
  @IsEnum(ESuspensionReason)
  @ApiProperty({ description: '댓글 내용' })
  @ApiProperty({ enum: ESuspensionReason, description: '신고 이유' })
  reportedReason: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  @ApiProperty({ required: false, description: '기타 신고 이유' })
  otherReportedReason?: string;
}
