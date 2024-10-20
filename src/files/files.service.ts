import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import * as dayjs from 'dayjs';
import { CreatePresignedUrlDto, PresignedUrlResponseDto } from './dto';
import { getExtensionFromMime } from 'src/common/utils';
import { FilesDAO } from './files.dao';
import { PostsDAO } from 'src/posts/posts.dao';
import { FilesEntity } from './entities/files.entity';
import { winstonLogger } from 'src/config/logger.config';

@Injectable()
export class FilesService {
  private s3Client: S3Client;
  private bucket = process.env.S3_BUCKET_NAME;

  constructor(
    private filesDAO: FilesDAO,
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
    let folder: string;
    if (['image/jpeg', 'image/png', 'image/gif'].includes(fileType)) {
      folder = 'images';
    } else if (
      [
        'application/pdf',
        'application/x-hwp',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ].includes(fileType)
    ) {
      folder = 'documents';
    } else {
      folder = 'others'; // zip 및 다른 파일 포함
    }
    const key = `${folder}/${year}/${monthStr}/${dayStr}/${uuidv4()}.${extension}`;

    try {
      const { url, fields } = await createPresignedPost(this.s3Client, {
        Bucket: this.bucket,
        Key: key,
        Conditions: [
          ['content-length-range', 0, 52428800], // 최대 50MB
          ['starts-with', '$Content-Type', fileType],
        ],
        Expires: 60, // 1분
      });

      return { url, fields, key } as PresignedUrlResponseDto;
    } catch (error) {
      console.error('Error generating presigned post data:', error);
      throw error;
    }
  }

  // 파일의 URL을 각각 추출하여 엔티티를 생성
  async uploadFiles(fileUrls: string[], postId: number): Promise<FilesEntity[]> {
    const post = await this.postsDAO.findOnePostByPostId(postId);
    if (!post) throw new NotFoundException(`${postId}번 게시글을 찾을 수 없습니다`);

    // 각 URL에서 파일 엔티티를 생성
    const fileUploadPromises = fileUrls.map(async (url) => {
      const fileType = this.extractFileTypeFromUrl(url);

      if (!fileType) {
        winstonLogger.warn(`잘못된 fileType: ${fileType} - 저장되지 않습니다.`);
      }

      if (!this.isValidUrl(url)) {
        winstonLogger.warn(`잘못된 URL: ${url}`);
        return null;
      }

      // 파일 엔티티 생성 및 저장
      const fileEntity = this.filesDAO.createFile({ url, postId, fileType });
      return await this.filesDAO.saveFile(fileEntity);
    });

    const savedFiles = (await Promise.all(fileUploadPromises)).filter((file) => file !== null);

    if (fileUrls.length !== savedFiles.length) {
      const lostCount = Number(fileUrls.length - savedFiles.length);
      console.log(`${lostCount}개의 파일이 저장되지 않았습니다.`);
    }

    return savedFiles;
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

  // 파일 타입 추출하는 함수
  private extractFileTypeFromUrl(url: string): string | null {
    try {
      const extension = url.split('.').pop();

      if (!extension) {
        winstonLogger.error('해당 URL에 확장자가 없습니다.');
        return null;
      }

      return extension.toLowerCase();
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
}
