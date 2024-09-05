import { IsNotEmpty, IsString } from 'class-validator';

export class UserInfoDto {
  @IsString()
  readonly nickname: string;

  @IsString()
  readonly email: string;
}
