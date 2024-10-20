import { IsEnum, IsOptional } from 'class-validator';
import { ESearchPostByAdmin } from '../enums/search-post-type.enum';
import { SearchQueryDto } from 'src/common/dto';
import { ApiProperty } from '@nestjs/swagger';

export class SearchPostQueryDto extends SearchQueryDto {
  @ApiProperty({
    description: '관리자 페이지 게시물 검색 타입',
    enumName: 'ESearchPostByAdmin',
    required: false,
    enum: [
      { value: ESearchPostByAdmin.POST_ID, description: '게시물 ID로 검색' },
      { value: ESearchPostByAdmin.POST_TITLE, description: '게시물 제목으로 검색' },
      { value: ESearchPostByAdmin.POST_CONTENT, description: '게시물 내용으로 검색' },
      { value: ESearchPostByAdmin.POST_AUTHOR, description: '게시물 작성자로 검색' },
    ],
  })
  @IsEnum(ESearchPostByAdmin)
  @IsOptional()
  type?: ESearchPostByAdmin;
}
