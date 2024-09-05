import { IsEnum, IsInt, IsNumber, IsString, Length } from 'class-validator';
import { EBoardType } from '../enum/board-type.enum';
import { Type } from 'class-transformer';

export class BasePostDto {
  @IsNumber()
  @Type(() => Number)
  postId: number;

  @IsEnum(EBoardType)
  boardType: EBoardType;
}
