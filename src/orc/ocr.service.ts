import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { createRequest } from './ocr-request';

@Injectable()
export class OcrService {
  private readonly visionClient: ImageAnnotatorClient;

  constructor() {
    this.visionClient = new ImageAnnotatorClient({
      keyFilename: process.env.GOOGLE_VISION_PATH,
    });
  }

  async detextTextFromImage(imageUri: string): Promise<string> {
    try {
      if (!imageUri) throw new Error('이미지 URI가 없습니다.');

      const requestsPayload = createRequest(imageUri);
      const [result] = await this.visionClient.batchAnnotateImages(requestsPayload);
      const detections = result.responses[0].fullTextAnnotation;
      // console.log(detections.text);

      const extractedName = this.extractNameFromText(detections.text);
      if (!extractedName) throw new NotFoundException('추출된 이름을 찾을 수 없습니다.');
      // console.log('추출된 이름', extractedName);

      return extractedName;
    } catch (error) {
      console.error('OCR 실행 중 에러 발생: ', error);
      throw new InternalServerErrorException('OCR 실행 중 에러 발생');
    }
  }

  private extractNameFromText(text: string): string | null {
    const nameRegex = /성\s*[\s\S]*?명\s*[:：]?\s*([\w가-힣]+)/;
    const match = text.match(nameRegex);

    return match ? match[1] : null;
  }
}
