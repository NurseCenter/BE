import { IsEnum, IsNotEmpty } from 'class-validator';
import { EReportStatus } from '../enum';
import { ApiProperty } from '@nestjs/swagger';
import { GetOneReportedPostDetailDto } from './get-one-reported-post-detail.dto';

export class UpdateReportStatusDto extends GetOneReportedPostDetailDto {
  @IsNotEmpty()
  @IsEnum(EReportStatus)
  @ApiProperty({ description: '신고 처리 상태', enum: EReportStatus })
  status: EReportStatus;
}
