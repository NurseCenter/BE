import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import * as dayjs from 'dayjs';
import { CreatePresignedUrlDto, PresignedUrlResponseDto } from './dto';
import { getExtensionFromMime } from 'src/common/utils';
import { FilesDAO } from './dao/files.dao';
import { PostsDAO } from 'src/posts/posts.dao';
import { FilesEntity } from './entities/files.entity';
import { winstonLogger } from 'src/config/logger.config';
import { fileTypeMappings, getFolderForFileType } from './file-type-mapping';
import { ImagesDAO } from './dao/images.dao';
import { ImagesEntity } from './entities/images.entity';

@Injectable()
export class FilesService {
  private s3Client: S3Client;
  private bucket = process.env.S3_BUCKET_NAME;

  constructor(
    private filesDAO: FilesDAO,
    private imagesDAO: ImagesDAO,
    private postsDAO: PostsDAO,
  ) {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  // presignedURL 생성
  async generatePresignedUrl(createPresignedUrlDto: CreatePresignedUrlDto): Promise<PresignedUrlResponseDto> {
    const { fileType } = createPresignedUrlDto;
    const now = dayjs();
    const year = now.year();
    const month = now.month() + 1;
    const day = now.date();

    const monthStr = String(month).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');

    // 확장자 결정
    const extension = getExtensionFromMime(fileType);

    // 폴더 결정
    const folder = getFolderForFileType(fileType);
    const key = `${folder}/${year}/${monthStr}/${dayStr}/${uuidv4()}.${extension}`;

    // 파일 크기 조건 결정
    // 이미지 파일 : 5MB, 나머지 파일: 10MB
    const maxSize = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(fileType) ? 5242880 : 10485760;

    try {
      const { url, fields } = await createPresignedPost(this.s3Client, {
        Bucket: this.bucket,
        Key: key,
        Conditions: [
          ['content-length-range', 0, maxSize],
          ['starts-with', '$Content-Type', fileType],
        ],
        Expires: 60, // 1분
      });

      return { url, fields, key } as PresignedUrlResponseDto;
    } catch (error) {
      winstonLogger.error('Error generating presigned post data:', error);
      throw new InternalServerErrorException('Presigned URL 생성 중 오류가 발생했습니다.');
    }
  }

  // 파일 업로드 처리
  async uploadFiles(attachments: IAttachments[], postId: number): Promise<FilesEntity[]> {
    const post = await this.postsDAO.findOnePostByPostId(postId);
    if (!post) throw new NotFoundException(`${postId}번 게시글을 찾을 수 없습니다`);

    // 각 URL에서 파일 엔티티를 생성
    const fileUploadPromises = attachments.map((attachment) => this.uploadFile(attachment, postId));
    const savedFiles = (await Promise.all(fileUploadPromises)).filter((file) => file !== null);

    this.logLostFiles(attachments.length, savedFiles.length);

    return savedFiles;
  }

  // 단일 파일 업로드 처리
  private async uploadFile(attachment: IAttachments, postId: number): Promise<FilesEntity | null> {
    const { fileName, fileUrl } = attachment;
    const fileType = this.extractFileTypeFromUrl(fileUrl);

    if (!fileType || !this.isValidUrl(fileUrl)) {
      winstonLogger.warn(`잘못된 URL 또는 fileType: ${fileUrl}, ${fileType} - 저장되지 않습니다.`);
      return null;
    }

    const fileEntity = this.filesDAO.createFile({ url: fileUrl, fileName, postId, fileType });
    return await this.filesDAO.saveFile(fileEntity);
  }

  // 이미지 파일 업로드 처리
  async uploadImages(fileUrls: string[], postId: number): Promise<ImagesEntity[]> {
    await this.validatePostExists(postId);

    const fileUploadPromises = fileUrls.map((url) => this.uploadImage(url, postId));
    const savedImages = (await Promise.all(fileUploadPromises)).filter((image) => image !== null);

    this.logLostFiles(fileUrls.length, savedImages.length);

    return savedImages;
  }

  // 게시글 유효성 검사
  private async validatePostExists(postId: number): Promise<void> {
    const post = await this.postsDAO.findOnePostByPostId(postId);
    if (!post) throw new NotFoundException(`${postId}번 게시글을 찾을 수 없습니다.`);
  }

  // 단일 이미지 업로드 처리
  private async uploadImage(url: string, postId: number): Promise<ImagesEntity | null> {
    const fileType = this.extractFileTypeFromUrl(url);

    if (!fileType || !this.isValidUrl(url)) {
      winstonLogger.warn(`잘못된 URL 또는 fileType: ${url}, ${fileType} - 저장되지 않습니다.`);
      return null;
    }

    const imageEntity = this.imagesDAO.createImage({ url, postId, fileType });
    return await this.imagesDAO.saveImage(imageEntity);
  }

  // 손실된 파일 로그
  private logLostFiles(expected: number, saved: number): void {
    if (expected !== saved) {
      const lostCount = expected - saved;
      winstonLogger.warn(`${lostCount}개의 파일이 저장되지 않았습니다.`);
    }
  }

  // 버킷 안의 파일을 삭제
  async deleteSingleFile(url: string): Promise<void> {
    if (!this.isValidUrl(url)) {
      throw new BadRequestException('유효하지 않은 URL입니다.');
    }

    const key = this.extractKeyFromUrl(url);

    try {
      const params = {
        Bucket: this.bucket,
        Key: key,
      };

      const command: DeleteObjectCommand = new DeleteObjectCommand(params);
      await this.s3Client.send(command);
    } catch (error) {
      winstonLogger.error(`파일 삭제 중 오류 발생: ${error.message}`);
      throw new InternalServerErrorException('파일 삭제 중 오류가 발생했습니다.');
    }
  }

  // URL에서 파일 타입 추출
  private extractFileTypeFromUrl(url: string): string | null {
    try {
      const urlParts = url.split('/');
      const folder = urlParts[4];
      const fileName = urlParts[urlParts.length - 1];
      const extension = fileName.split('.').pop();

      return this.getMimeTypeWithFolder(folder, extension) || extension?.toLowerCase() || null;
    } catch (error) {
      winstonLogger.error(`파일 URL 처리 중 오류: ${error.message}`);
      throw new BadRequestException(`파일 URL을 처리하는 중 오류가 발생했습니다: ${error.message}`);
    }
  }

  // URL 형식 검증 함수
  private isValidUrl(url: string): boolean {
    // AWS S3 URL의 기본 형식을 정규 표현식으로 검증
    const s3UrlPattern = /^https:\/\/[a-z0-9.-]+\.s3\.[a-z0-9-]+\.amazonaws\.com\/.+$/;

    // URL 형식이 맞고, URL에 유효한 문자들만 포함되어 있는지 확인
    return s3UrlPattern.test(url);
  }

  // URL에서 키 추출하는 함수
  private extractKeyFromUrl(url: string): string {
    const urlParts = url.split('/');
    return urlParts.slice(3).join('/');
  }

  // 폴더 이름과 파일 타입을 기반으로 MIME 타입을 찾음
  private getMimeTypeWithFolder(folder: string, fileType: string): string | null {
    const mimeType = Object.keys(fileTypeMappings).find(
      (key) => fileTypeMappings[key] === folder && key.endsWith(fileType),
    );

    return mimeType || null;
  }
}
