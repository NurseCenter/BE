import { IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationQueryDto {
  @ApiProperty({
    description: '페이지 번호',
    example: 1,
  })
  @IsNumber()
  page: number;

  @ApiProperty({
    description: '페이지당 항목 수',
    example: 10,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  limit?: number;
}
