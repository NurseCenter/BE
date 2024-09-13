import { ApiProperty } from '@nestjs/swagger';

export class PresignedUrlResponseDto {
  @ApiProperty({
    description: 'S3에 업로드할 파일의 presigned URL',
    example: 'https://example-bucket.s3.amazonaws.com/upload',
  })
  url: string;

  @ApiProperty({
    description: 'S3에 파일을 업로드할 때 필요한 폼 필드들',
    example: {
      key: 'images/2024/09/10/uuid-file.png',
      bucket: 'example-bucket',
      policy: 'base64-policy',
      signature: 'signature',
      'x-amz-algorithm': 'AWS4-HMAC-SHA256',
    },
  })
  fields: Record<string, string>;

  @ApiProperty({
    description: '파일의 키(날짜 및 이름)',
    example: 'images/2024/09/10/uuid-file.png',
  })
  key: string;
}
