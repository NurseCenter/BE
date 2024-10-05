import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class SendPhoneVerificationDto {
  @ApiProperty({
    description: '휴대폰 번호',
    example: '01012345678',
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}
