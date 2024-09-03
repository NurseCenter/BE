import { Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import * as dayjs from 'dayjs';

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

  async generatePresignedUrl(fileType: string): Promise<{ url: string; fields: Record<string, string>; key: string }> {
    const bucket = process.env.S3_BUCKET_NAME;
    const now = dayjs();
    const year = now.year();
    const month = now.month() + 1;
    const day = now.date();

    const monthStr = String(month).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const key = `post_image/${year}/${monthStr}/${dayStr}/${uuidv4()}.${fileType.split('/')[1]}`;

    try {
      const { url, fields } = await createPresignedPost(this.s3Client, {
        Bucket: bucket,
        Key: key,
        Conditions: [
          ['content-length-range', 0, 10485760], // 최대 10MB
          ['starts-with', '$Content-Type', 'image/'],
        ],
        Expires: 3600, // 1시간
      });

      return { url, fields, key };
    } catch (error) {
      console.error('Error generating presigned post data:', error);
      throw error;
    }
  }
}
