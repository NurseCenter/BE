import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class RejectUserDto {
  @ApiProperty({
    description: '회원 ID',
    example: 123,
  })
  @IsNumber()
  userId: number;

  @ApiProperty({
    description: '거절 사유',
    example: '업로드한 인증서류 파일이 졸업증명서 혹은 재학증명서가 아닙니다. 확인 부탁드립니다.',
  })
  @IsString()
  rejectedReason: string;
}
