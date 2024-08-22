import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class GetPostsQueryDto {
  @IsOptional()
  @IsString()
  sort?: string = 'date';

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
