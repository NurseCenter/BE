import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class FindEmailDto {
  @ApiProperty({
    description: '회원 실명',
    example: '고길동',
  })
  @IsString()
  readonly username: string;

  @ApiProperty({
    description: '휴대폰 번호',
    example: '01012345678',
  })
  @IsString()
  readonly phoneNumber: string;
}
