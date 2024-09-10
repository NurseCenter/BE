import { Controller, Get, Body } from '@nestjs/common';
import { OcrService } from './ocr.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';


@ApiTags('Ocr')
@Controller('ocr')
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

  @ApiOperation({ summary: '이미지 URI를 통해 텍스트를 추출합니다.' })
  @ApiQuery({ name: 'imageUri', type: String, description: 'S3 버킷에 저장된 이미지의 URI' })
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
  @Get('detect-text')
  async detectText(@Body('imageUri') imageUri: string): Promise<string> {
    return await this.ocrService.detextTextFromImage(imageUri);
  }
}
