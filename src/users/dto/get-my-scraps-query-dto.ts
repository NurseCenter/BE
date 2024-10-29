import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto';
import { EPostsBaseSortType } from 'src/common/enums';

export class GetMyScrapsQueryDto extends PaginationQueryDto {
  @ApiProperty({
    description:
      '정렬 기준 (최신순: 게시물 작성일자 기준 내림차순, 공감순: 좋아요 기준 내림차순, 작성순: 게시물 작성일자 기준 오름차순)',
    enum: ['latest', 'popular', 'viewCounts', 'oldest'],
    example: 'latest',
    required: false,
  })
  @IsOptional()
  @IsEnum(['latest', 'popular', 'viewCounts', 'oldest'])
  sort?: EPostsBaseSortType;
}
