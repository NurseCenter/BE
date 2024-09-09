import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ESortOrder, ESortType } from '../enum/sort-type.enum';

export class PaginateQueryDto {
  @IsOptional()
  @IsEnum(ESortType)
  @ApiProperty({ enum: ESortOrder, required: false, description: '정렬 순서' })
  sortType?: ESortType = ESortType.DATE;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @ApiProperty({ required: false, description: '페이지 번호' })
  page?: number = null;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @ApiProperty({ required: false, description: '페이지당 항목 수', type: Number })
  limit?: number = null;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: '검색어' })
  search?: string;

  @IsOptional()
  @IsEnum(ESortOrder)
  @ApiProperty({ enum: ESortType, required: false, description: '정렬 기준' })
  sortOrder?: ESortOrder = ESortOrder.DESC;
}
