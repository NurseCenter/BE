import { Injectable } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import * as dayjs from 'dayjs';
import { CreatePresignedUrlDto, PresignedUrlResponseDto } from './dto';
import { getExtensionFromMime } from 'src/common/utils';
import { FilesDAO } from './files.dao';
import { FilesEntity } from './entities/files.entity';

@Injectable()
export class FilesService {
  private s3Client: S3Client;

  constructor(private filesDAO: FilesDAO) {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async generatePresignedUrl(createPresignedUrlDto: CreatePresignedUrlDto): Promise<PresignedUrlResponseDto> {
    const { fileType } = createPresignedUrlDto;
    const bucket = process.env.S3_BUCKET_NAME;
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
        Bucket: bucket,
        Key: key,
        Conditions: [
          ['content-length-range', 0, 20971520], // 최대 20MB
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

  async createFile(fileData: Partial<FilesEntity>): Promise<FilesEntity> {
    const fileEntity = this.filesDAO.createFile(fileData);
    const savedFile = await this.filesDAO.saveFile([fileEntity]);
    return savedFile[0];
  }
}
