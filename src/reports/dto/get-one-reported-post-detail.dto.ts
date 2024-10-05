import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class GetOneReportedPostDetailDto {
  @IsNotEmpty()
  @Type(() => Number)
  @ApiProperty({ description: '신고 테이블 고유 ID', example: 36 })
  reportId: number;

  @IsNotEmpty()
  @Type(() => Number)
  @ApiProperty({ description: '게시물 ID', example: 15 })
  postId: number;
}
