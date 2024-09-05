import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ESortType, ESortOrder } from '../enum/sort-type.enum';
export class PaginateQueryDto {
  @IsOptional()
  @IsEnum(ESortType)
  sortType?: ESortType = ESortType.DATE;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = null;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = null;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ESortOrder)
  sortOrder?: ESortOrder = ESortOrder.DESC;
}
