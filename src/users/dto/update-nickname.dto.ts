import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';
import { NICKNAME_REGEX } from 'src/auth/dto';

export class UpdateNicknameDto {
  @ApiProperty({
    description: '새로운 닉네임 (2~8자, 영문 대소문자 혹은 한글)',
    example: 'newNickname',
  })
  @IsString()
  @Matches(NICKNAME_REGEX)
  readonly newNickname: string;
}