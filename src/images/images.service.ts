import { Injectable } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import * as dayjs from 'dayjs';
import { CreatePresignedUrlDto, PresignedUrlResponseDto } from './dto';

@Injectable()
export class ImagesService {
  private s3Client: S3Client;

  constructor() {
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
    
    //폴더 및 확장자 선택
    let folder: string;
    let extension: string;

    switch (fileType) {
      case 'image/jpeg':
      case 'image/png':
      case 'image/gif':
        folder = 'images';
        extension = fileType.split('/')[1];
        break;
      case 'application/pdf':
        folder = 'documents';
        extension = 'pdf';
        break;
      case 'application/x-hwp':
        folder = 'documents';
        extension = 'hwp';
        break;
      default:
        folder = 'others';
        extension = 'bin';
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
        Expires: 3600,
      });

      return { url, fields, key } as PresignedUrlResponseDto;
    } catch (error) {
      console.error('Error generating presigned post data:', error);
      throw error;
    }
  }
}
