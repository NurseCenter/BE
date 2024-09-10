import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber } from 'class-validator';

export class ApprovalUserDto {
  @ApiProperty({
    description: '회원 ID',
    example: 123,
  })
  @IsNumber()
  userId: number;

  @ApiProperty({
    description: '회원 가입 승인 여부',
    example: true,
  })
  @IsBoolean()
  isApproved: boolean;
}
