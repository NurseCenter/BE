import { IsString, Matches } from 'class-validator';
import { NICKNAME_REGEX } from 'src/auth/dto';

export class UpdateNicknameDto {
  @IsString()
  @Matches(NICKNAME_REGEX)
  readonly newNickname: string;
}
