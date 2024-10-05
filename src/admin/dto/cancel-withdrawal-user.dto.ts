import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class CancelWithdrawalDto {
  @IsNotEmpty()
  @Type(() => Number)
  @ApiProperty({ description: '강제 탈퇴 당한 회원의 ID', example: 17 })
  userId: number;
}
