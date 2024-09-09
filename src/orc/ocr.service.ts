import { Injectable } from "@nestjs/common";
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

    async detextTextFromImage(imageUri: string): Promise<void> {
        try{
            if (!imageUri) throw new Error('이미지 URI가 없습니다.');

            const requestsPayload = createRequest(imageUri);
            const [result] = await this.visionClient.batchAnnotateImages(requestsPayload);
            const detections = result.responses[0].fullTextAnnotation;
            
            console.log(detections.text);
        } catch(error) {
            console.error("OCR 실행 중 에러 발생: ", error);
        }
    }
}