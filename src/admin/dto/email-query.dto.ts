import { IsNotEmpty, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { EEmailType } from '../enums';
import { ApiProperty } from '@nestjs/swagger';

export class EmailQueryDto {
  @ApiProperty({
    description: '발송할 이메일 유형',
    enum: EEmailType,
    example: EEmailType.REJECTION, 
  })
  @IsNotEmpty()
  @IsEnum(EEmailType)
  emailType: string;

  @ApiProperty({
    description: '이메일을 받을 회원의 ID',
    example: 123,
  })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({
    description: '발송할 이메일 본문에 들어가는 사유',
    required: false,
    example: '정회원 승인 거절, 활동 정지, 강제 탈퇴 사유',
  })
  @IsOptional()
  @IsNotEmpty()
  reason?: string;
}
