import { Controller, Post, Body, Delete, Param } from '@nestjs/common';
import { CreatePresignedUrlDto, PresignedUrlResponseDto } from './dto';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FilesService } from './files.service';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('presigned-url')
  @ApiOperation({
    summary: 'S3 버킷에 파일 업로드를 위한 pre-signed URL 포함 인증 정보 제공',
    description: '주어진 파일 타입에 대한 S3 업로드를 위한 pre-signed URL과 관련된 정보를 제공함.',
  })
  @ApiBody({
    type: CreatePresignedUrlDto,
    description: '업로드할 파일의 MIME 타입 (예: image/jpeg, application/pdf)',
  })
  @ApiResponse({
    status: 200,
    description: 'S3 업로드 인증 정보 제공 성공',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'S3에 파일을 업로드할 수 있는 pre-signed URL',
          example: 'https://example-bucket.s3.amazonaws.com/?AWSAccessKeyId=ASIA...&Policy=...&Signature=...',
        },
        fields: {
          type: 'object',
          description: '업로드 요청에 필요한 추가 필드',
          properties: {
            key: {
              type: 'string',
              description: '파일의 키 (경로 및 이름)',
              example: 'certification-document/user-1234abcd-5678-efgh-ijkl-1234567890ab.jpeg',
            },
            policy: {
              type: 'string',
              description: '업로드 정책',
              example: 'eyJleHBpcmVk...',
            },
            signature: {
              type: 'string',
              description: '요청 서명',
              example: 't5J3C8B/5Q1oLPwF5DdJm2BHzA3gK0p5qRgy2S59RaI=',
            },
          },
        },
        key: {
          type: 'string',
          description: 'S3에 저장될 파일의 경로 및 이름',
          example: 'certification-document/user-1234abcd-5678-efgh-ijkl-1234567890ab.jpeg',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'integer',
          description: 'HTTP 상태 코드',
          example: 400,
        },
        message: {
          type: 'string',
          description: '오류 메시지',
          example: '파일 타입이 제공되지 않았습니다.',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '리소스를 찾을 수 없음',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'integer',
          description: 'HTTP 상태 코드',
          example: 404,
        },
        message: {
          type: 'string',
          description: '오류 메시지',
          example: '생성된 URL을 찾을 수 없습니다.',
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: '서버 오류',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'integer',
          description: 'HTTP 상태 코드',
          example: 500,
        },
        message: {
          type: 'string',
          description: '오류 메시지',
          example: '서버에서 처리 중 오류가 발생했습니다.',
        },
      },
    },
  })
  async getPresignedUrl(@Body() createPresignedUrlDto: CreatePresignedUrlDto): Promise<PresignedUrlResponseDto> {
    return await this.filesService.generatePresignedUrl(createPresignedUrlDto);
  }

  @Delete(':url')
  @ApiParam({
    name: 'url',
    required: true,
    description: '삭제할 파일의 S3 URL (인코딩된 형태).',
    type: String,
  })
  @ApiResponse({ 
    status: 200, 
    description: '파일이 성공적으로 삭제되었습니다.', 
    schema: {
      example: {
        message: '파일이 성공적으로 삭제되었습니다.',
      },
    },
  })
  @ApiResponse({ 
    status: 400, 
    description: '유효하지 않은 URL입니다.' 
  })
  @ApiResponse({ 
    status: 404, 
    description: '파일을 찾을 수 없습니다.' 
  })
  @ApiResponse({ 
    status: 500, 
    description: '서버 오류가 발생했습니다.' 
  })
  async deleteFile(@Param('url') url: string) {
    const decodedUrl = decodeURIComponent(url);
    console.log(decodedUrl)
    await this.filesService.deleteSingleFile(decodedUrl);
    return { message : '파일이 성공적으로 삭제되었습니다.' }
  }
}
