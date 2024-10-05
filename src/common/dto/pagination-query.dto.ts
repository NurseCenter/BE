import { IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class PaginationQueryDto {
  @ApiProperty({
    description: '페이지 번호',
    example: 1,
    default: 1,
  })
  @Min(1, { message: '페이지 번호는 양의 정수로, 최소값은 1입니다.' })
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({
    description: '페이지당 항목 수',
    example: 10,
    required: false,
    default: 10,
  })
  @Type(() => Number)
  @Min(1, { message: '1페이지에 최소 1개 이상의 내용이 첨부되어야 합니다.' })
  @IsOptional()
  limit?: number = 10;

  @IsOptional()
  @ApiProperty({
    description: '특정 게시물에 대한 댓글 조회시, 답글이 함께 나오도록 하는 옵션 (Optional Query Parameter)',
    example: true,
    required: false,
    default: false,
  })
  withReplies?: boolean = false;
}
