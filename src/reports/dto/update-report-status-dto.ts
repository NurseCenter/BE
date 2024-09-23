import { IsEnum, IsNotEmpty } from 'class-validator';
import { GetOneReportedDetailDto } from './get-one-reported-detail.dto';
import { EReportStatus } from '../enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateReportStatusDto extends GetOneReportedDetailDto {
  @IsNotEmpty()
  @IsEnum(EReportStatus)
  @ApiProperty({ description: '신고 처리 상태', enum: EReportStatus })
  status: EReportStatus;
}
