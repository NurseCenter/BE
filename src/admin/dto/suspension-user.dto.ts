import { IsNotEmpty, IsString } from 'class-validator';
import { ESuspensionDuration } from '../enums';
import { ApiProperty } from '@nestjs/swagger';

export class SuspensionUserDto {
  @ApiProperty({
    description: '사용자 ID',
    example: 123,
  })
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    description: '정지 사유',
    example: '부적절한 활동',
  })
  @IsString()
  @IsNotEmpty()
  suspensionReason: string;

  @ApiProperty({
    description: '정지 기간',
    enum: ESuspensionDuration,
    example: '1w',
  })
  @IsString()
  @IsNotEmpty()
  suspensionDuration: ESuspensionDuration;
}
