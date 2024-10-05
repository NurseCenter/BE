import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BaseReportedDto } from './base-reported-dto';

export class ReportedPostDto extends BaseReportedDto {
  @IsNotEmpty()
  @ApiProperty({ description: '게시물 ID', example: 1001 })
  postId: number;
}
