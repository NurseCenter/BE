import { ApiProperty } from '@nestjs/swagger';

export class UploadInfoResponseDto {
  @ApiProperty({ description: 'S3 업로드 URL' })
  url: string;

  @ApiProperty({ description: 'S3 업로드 필드', type: Object })
  fields: Record<string, string>;

  @ApiProperty({ description: '파일 폴더 및 이름' })
  key: string;
}
