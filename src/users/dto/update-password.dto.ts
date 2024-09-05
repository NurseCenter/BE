import { IsString, Matches } from 'class-validator';
import { PASSWORD_REGEX } from 'src/auth/dto';

export class UpdatePasswordDto {
  @IsString()
  @Matches(PASSWORD_REGEX)
  readonly oldPassword: string;

  @IsString()
  @Matches(PASSWORD_REGEX)
  readonly newPassword: string;
}
