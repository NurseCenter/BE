import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { SortType, SortOrder } from '../enum/sortType.enum';
import { ApiProperty } from '@nestjs/swagger';
export class PaginateQueryDto {
  @IsOptional()
  @IsEnum(SortType)
  @ApiProperty({ enum: SortOrder, required: false, description: '정렬 순서' })
  sortType?: SortType = SortType.DATE;

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
  @IsEnum(SortOrder)
  @ApiProperty({ enum: SortType, required: false, description: '정렬 기준' })
  sortOrder?: SortOrder = SortOrder.DESC;
}
