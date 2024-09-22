import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto';

export class GetMyScrapsQueryDto extends PaginationQueryDto {
  @ApiProperty({
    description: '정렬 기준 (최신순: 게시물 작성일자 내림차순, 인기순: 좋아요 내림차순)',
    enum: ['latest', 'popular'],
    example: 'latest',
    required: false,
  })
  @IsOptional()
  @IsEnum(['latest', 'popular'])
  sort?: 'latest' | 'popular';
}
