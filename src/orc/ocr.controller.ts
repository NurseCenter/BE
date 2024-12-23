import { Controller, Body, Post } from '@nestjs/common';
import { OcrService } from './ocr.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Ocr')
@Controller('ocr')
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

  @Post('detect-text')
  @ApiOperation({ summary: '이미지 URI를 업로드하면 해당 이미지에서 텍스트(증명서의 실명)를 추출' })
  @ApiBody({
    description: 'S3 버킷에 저장된 이미지의 URI',
    schema: {
      type: 'object',
      properties: {
        imageUri: {
          type: 'string',
          description: 'S3 버킷 이미지 URI',
          example: 'https://your-s3-bucket-url/image.jpg',
        },
      },
      required: ['imageUri'],
    },
  })
  @ApiResponse({
    status: 200,
    description: '성공적으로 이름을 추출한 경우',
    schema: {
      example: {
        name: '홍길동',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청으로 인한 오류',
    schema: {
      example: {
        statusCode: 400,
        message: '이미지 URI가 없습니다.',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '추출된 이름을 찾을 수 없는 경우',
    schema: {
      example: {
        statusCode: 404,
        message: '추출된 이름을 찾을 수 없습니다.',
        error: 'Not Found',
      },
    },
  })
  async detectText(@Body() body: { imageUri: string }): Promise<{ name: string }> {
    const { imageUri } = body;
    const name = await this.ocrService.detextTextFromImage(imageUri);
    return { name };
  }
}
