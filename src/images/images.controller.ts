import { Controller, Post, Body } from '@nestjs/common';
import { ImagesService } from './images.service';
import { CreatePresignedUrlDto, PresignedUrlResponseDto } from './dto';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post('presigned-url')
  async getPresignedUrl(@Body() createPresignedUrlDto: CreatePresignedUrlDto): Promise<PresignedUrlResponseDto> {
    return await this.imagesService.generatePresignedUrl(createPresignedUrlDto);
  }
}
