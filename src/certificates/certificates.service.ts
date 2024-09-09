import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ImagesService } from 'src/images/images.service';
import { v4 as uuidv4 } from 'uuid';
import { UploadInfoResponseDto } from './dto';
import { UsersDAO } from 'src/users/users.dao';

@Injectable()
export class CertificatesService {
  constructor(
    private readonly imagesService: ImagesService,
    private readonly usersDAO: UsersDAO,
  ) {}

  // pre-signed URL 생성
  async generatePreSignedUrl(fileType: string): Promise<UploadInfoResponseDto> {
    // 파일 확장자 넣어주기
    const extension = fileType.split('/')[1] || 'bin'; // 기본 확장자 'bin' 설정

    // S3에 업로드할 파일 키 생성
    // certification-document 폴더 안에 'user-{103}/어쩌구'로 저장됨.
    const key = `certification-document/user-${uuidv4()}.${extension}`;

    // URL 생성후 리턴값 반환
    const { url, fields } = await this.imagesService.generatePresignedUrl(fileType);
    if (!url || !fields) throw new NotFoundException('생성된 URL을 찾을 수 없습니다.');

    return { url, fields, key };
  }

  // 회원의 인증서 이미지 URL 정보를 업데이트
  async updateUserCertificationUrl(userId: number, imageUrl: string) {
    const updateduser = await this.usersDAO.findUserByUserId(userId);
    if (!updateduser) throw new NotFoundException('해당 회원이 존재하지 않습니다.');

    updateduser.certificationDocumentUrl = imageUrl;
    await this.usersDAO.saveUser(updateduser);
    if (updateduser.certificationDocumentUrl !== imageUrl) {
      throw new BadRequestException('인증서 URL 업데이트에 실패했습니다.');
    }

    return updateduser.certificationDocumentUrl;
  }
}
