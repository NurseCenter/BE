import { ApiProperty } from '@nestjs/swagger';
import { PaginationQueryDto, SearchQueryDto } from 'src/common/dto';
import { SortQueryDto } from 'src/common/dto/sort-query.dto';

export class GetPostsQueryDto extends PaginationQueryDto {
  @ApiProperty({ type: SortQueryDto })
  sort: SortQueryDto;

  @ApiProperty({ type: SearchQueryDto })
  search: SearchQueryDto;

  constructor() {
    super();
    this.sort = new SortQueryDto();
    this.search = new SearchQueryDto();
  }
}
