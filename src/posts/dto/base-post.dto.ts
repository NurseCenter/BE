import { IsEnum, IsNumber } from 'class-validator';
import { EBoardType } from '../enum/board-type.enum';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class BasePostDto {
  @IsNumber()
  @ApiProperty({ description: '게시글 ID' })
  @Type(() => Number)
  postId: number;

  @IsEnum(EBoardType)
  @ApiProperty({ description: '게시판 카테고리' })
  boardType: EBoardType;
}
