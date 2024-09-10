import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/common/dto';

export class GetMyPostsQueryDto extends PaginationQueryDto {
  @ApiProperty({
    description: '정렬 기준 (최신순: 게시물 작성 최신 일자 내림차순, 인기순: 좋아요 많은 순)',
    enum: ['latest', 'popular'],
    example: 'latest',
    required: false,
  })
  @IsOptional()
  @IsEnum(['latest', 'popular'])
  sort?: 'latest' | 'popular';
}
