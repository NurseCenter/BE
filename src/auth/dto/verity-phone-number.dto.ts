import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyPhoneNumberDto {
  @ApiProperty({
    description: '전화번호',
    example: '01012345678',
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({
    description: '6자리 숫자 인증 코드',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  code: string;
}
