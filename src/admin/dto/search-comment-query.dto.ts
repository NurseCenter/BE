import { IsEnum, IsOptional } from 'class-validator';
import { ESearchCommentByAdmin } from '../enums/search-comment-type.enum';
import { SearchQueryDto } from 'src/common/dto';
import { ApiProperty } from '@nestjs/swagger';

export class SearchCommentQueryDto extends SearchQueryDto {
  @ApiProperty({
    description: '관리자 페이지 댓글 검색 타입',
    enumName: 'ESearchCommentByAdmin',
    required: false,
    enum: [
      { value: ESearchCommentByAdmin.COMMENT_ID, description: '댓글 ID로 검색' },
      { value: ESearchCommentByAdmin.POST_TITLE, description: '게시물 제목으로 검색' },
      { value: ESearchCommentByAdmin.COMMENT_CONTENT, description: '댓글 내용으로 검색' },
      { value: ESearchCommentByAdmin.COMMENT_AUTHOR, description: '댓글 작성자로 검색' },
    ],
  })
  @IsEnum(ESearchCommentByAdmin)
  @IsOptional()
  type?: ESearchCommentByAdmin;
}
