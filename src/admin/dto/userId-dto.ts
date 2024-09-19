import { IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class UserIdDto {
  @IsNotEmpty({ message: '회원 ID를 입력해주세요.' })
  @Type(() => Number)
  userId: number;
}
