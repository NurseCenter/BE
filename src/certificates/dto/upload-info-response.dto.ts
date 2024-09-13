import { ApiProperty } from '@nestjs/swagger';
import { PresignedUrlResponseDto } from 'src/images/dto';

export class UploadInfoResponseDto extends PresignedUrlResponseDto {
  @ApiProperty({
    description: 'S3에 파일을 업로드하기 위해 요청에 포함해야 할 필드들',
    type: 'object',
    additionalProperties: { type: 'string' },
    example: {
      key: 'certification-document/user-1234abcd-5678-efgh-ijkl-1234567890ab.jpeg',
      policy: 'eyJleHBpcmVk...',
      signature: 't5J3C8B/5Q1oLPwF5DdJm2BHzA3gK0p5qRgy2S59RaI=',
    },
  })
  fields: Record<string, string>;

  @ApiProperty({
    description: 'S3에 저장될 파일의 경로 및 이름',
    example: 'certification-document/user-1234abcd-5678-efgh-ijkl-1234567890ab.jpeg',
  })
  key: string;
}
