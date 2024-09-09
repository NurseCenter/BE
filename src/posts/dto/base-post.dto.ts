import { IsEnum,  IsNumber } from 'class-validator';
import { BoardType } from '../enum/boardType.enum';
import { Type } from 'class-transformer';

export class BasePostDto {
  @IsNumber()
  @Type(() => Number)
  postId: number;

  @IsEnum(BoardType)
  boardType: BoardType;
}
