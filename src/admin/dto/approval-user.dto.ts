import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class ApprovalUserDto {
  @ApiProperty({
    description: '회원 ID',
    example: 123,
  })
  @IsNumber()
  userId: number;  
}
