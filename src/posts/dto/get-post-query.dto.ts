import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { SortType, SortOrder } from '../enum/sortType.enum';
export class PaginateQueryDto {
  @IsOptional()
  @IsEnum(SortType)
  sortType?: SortType = SortType.DATE;

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
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
