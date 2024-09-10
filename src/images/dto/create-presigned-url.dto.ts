import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePresignedUrlDto {
  @ApiProperty({
    description: '업로드할 파일의 MIME 타입',
    example: 'image/jpeg',
    enum: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/x-hwp'],
  })
  @IsString()
  @IsNotEmpty()
  fileType: string;
}