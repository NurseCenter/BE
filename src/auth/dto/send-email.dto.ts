import { IsString } from 'class-validator';

export class SendEmailDto {
  @IsString()
  readonly nickname: string;

  @IsString()
  readonly email: string;

  @IsString()
  readonly emailVerificationLink: string;
}
