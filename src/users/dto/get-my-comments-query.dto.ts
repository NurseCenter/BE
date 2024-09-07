import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/common/dto';

export class GetMyCommentsQueryDto extends PaginationQueryDto {
  @ApiProperty({
    description: '정렬 기준',
    enum: ['latest', 'popular'],
    example: 'latest',
    required: false,
  })
  @IsOptional()
  @IsEnum(['latest', 'popular'])
  sort?: 'latest' | 'popular';
}
