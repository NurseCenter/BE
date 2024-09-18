import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ESortOrder, ESortType } from '../enum/sort-type.enum';
import { Type } from 'class-transformer';

export class GetPostsQueryDto {
  @IsOptional()
  @IsEnum(ESortType)
  @ApiProperty({ enum: ESortOrder, required: false, description: '정렬 순서' })
  sortType?: ESortType = ESortType.DATE;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @ApiProperty({ required: false, description: '페이지 번호' })
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @ApiProperty({ required: false, description: '페이지당 항목 수', type: Number })
  limit?: number = 10;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: '검색어' })
  search?: string;

  @IsOptional()
  @IsEnum(ESortOrder)
  @ApiProperty({ enum: ESortType, required: false, description: '정렬 기준' })
  sortOrder?: ESortOrder = ESortOrder.DESC;
}
