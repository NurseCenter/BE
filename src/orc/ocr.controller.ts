import { Controller, Get, Body } from '@nestjs/common';
import { OcrService } from './ocr.service';

@Controller('ocr')
export class OcrController {
    constructor(private readonly ocrService: OcrService) {}

    @Get('detect-text')
    async detectText(@Body('imageUri') imageUri: string): Promise<void> {
        await this.ocrService.detextTextFromImage(imageUri);
    }
}