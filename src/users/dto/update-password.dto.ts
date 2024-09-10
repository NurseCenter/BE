import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';
import { PASSWORD_REGEX } from 'src/auth/dto';

export class UpdatePasswordDto {
  @ApiProperty({
    description: '현재 비밀번호 (8~16자, 소문자와 대문자, 숫자, 특수 문자를 각각 하나 이상 포함), 허용되는 특수문자 : !@#$%^&*?_',
    example: 'OldPassword1!',
  })
  @IsString()
  @Matches(PASSWORD_REGEX)
  readonly oldPassword: string;

  @ApiProperty({
    description: '새로운 비밀번호 (8~16자, 소문자와 대문자, 숫자, 특수 문자를 각각 하나 이상 포함), 허용되는 특수문자 : !@#$%^&*?_',
    example: 'NewPassword1!',
  })
  @IsString()
  @Matches(PASSWORD_REGEX)
  readonly newPassword: string;
}