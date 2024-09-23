import { IsNotEmpty } from 'class-validator';
import { BaseReportedDto } from './base-reported-dto';
import { ApiProperty } from '@nestjs/swagger';

export class ReportedPostDto extends BaseReportedDto {
  @IsNotEmpty()
  @ApiProperty({ description: '게시물 ID', example: 1001 })
  postId: number;
}
