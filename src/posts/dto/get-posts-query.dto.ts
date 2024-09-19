import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto';
import { ESortType, ESortOrder } from 'src/common/enums';

export class GetPostsQueryDto extends PaginationQueryDto {
  @ApiProperty({ enum: ESortType, required: false })
  @IsOptional()
  @IsEnum(ESortType)
  sortType?: ESortType;

  @ApiProperty({ enum: ESortOrder, required: false })
  @IsOptional()
  @IsEnum(ESortOrder)
  sortOrder?: ESortOrder;

  @ApiProperty({ required: false })
  @IsOptional()
  search?: string;

  constructor() {
    super();
  }
}