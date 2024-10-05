import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ESortType, ESortOrder } from '../enums';

export class SortQueryDto {
  @IsOptional()
  @IsEnum(ESortType)
  @ApiProperty({ enum: ESortType, required: false, description: '정렬 기준 (오름차순, 내림차순)' })
  sortType?: ESortType = ESortType.DATE;

  @IsOptional()
  @IsEnum(ESortOrder)
  @ApiProperty({ enum: ESortOrder, required: false, description: '정렬 순서 (작성일, 좋아요수, 전체' })
  sortOrder?: ESortOrder = ESortOrder.DESC;
}
