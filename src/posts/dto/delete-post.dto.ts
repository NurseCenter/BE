import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
} from 'class-validator';
import { BoardType } from '../enum/boardType.enum';

export class DeletePostDto {
  @IsNumber()
  @IsNotEmpty({ message: 'userId는 반드시 포함되어야 합니다.' })
  userId: number;
}
