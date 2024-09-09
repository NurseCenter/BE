import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CertificatesService } from './certificates.service';
import { UpdateUserCertificationDto, UploadInfoResponseDto } from './dto';

@ApiTags('Certificates')
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  // S3 업로드를 위한 pre-signed URL을 제공
  @Get('upload-info')
  @ApiOperation({ summary: 'S3 업로드 인증 정보 제공' })
  @ApiResponse({ status: 200, description: 'S3 업로드 인증 정보 제공 성공' })
  async getUploadInfo(
    @Query('fileType') fileType: string,
    @Query('userId') userId: number,
  ): Promise<UploadInfoResponseDto> {
    return await this.certificatesService.generatePreSignedUrl(fileType, userId);
  }

  // 회원의 이미지 인증서 URL을 업데이트
  @Post('update-user-certification')
  @ApiOperation({ summary: 'S3 업로드 후 인증서 이미지 URL 업데이트' })
  @ApiResponse({ status: 200, description: '회원의 인증서 URL 업데이트 성공' })
  async postUploadUrl(@Body() updateUserCertificationDto: UpdateUserCertificationDto) {
    const { userId, imageUrl } = updateUserCertificationDto;
    const updatedUrl = await this.certificatesService.updateUserCertificationUrl(userId, imageUrl);
    return { message: '회원의 인증서 URL이 성공적으로 업데이트되었습니다.', imageUrl: updatedUrl };
  }
}
