import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsNotEmpty } from 'class-validator';

export class DeletionUserDto {
  @ApiProperty({
    description: '사용자 ID',
    example: 123,
  })
  @IsNotEmpty()
  @Type(() => Number)
  readonly userId: number;

  @ApiProperty({
    description: '탈퇴 처리한 사유',
    example:
      '이미 신고가 5번 이상 들어와서 정지처리를 여러번 하였음. 그래서 개인적으로도 경고를 줬으나 커뮤니티 규칙을 위반함.',
  })
  @IsString()
  @IsNotEmpty()
  readonly deletionReason: string;
}
