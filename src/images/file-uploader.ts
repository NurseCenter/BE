import { ImagesDAO } from 'src/images/images.dao';
import { ImagesService } from 'src/images/images.service';
import { PostsEntity } from '../posts/entities/base-posts.entity';

export class FileUploader {
  constructor(
    private imagesService: ImagesService,
    private imagesDAO: ImagesDAO,
  ) {}

  async handleFiles(fileTypes: string[], createdPost: PostsEntity) {
    if (!fileTypes || fileTypes.length === 0) {
      return [];
    }

    const presignedPostData = await Promise.all(
      fileTypes.map(async (fileType) => this.imagesService.generatePresignedUrl({ fileType })),
    );

    const fileEntities = await Promise.all(
      presignedPostData.map(async (data) => {
        const fileEntity = {
          url: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${data.key}`,
          post: createdPost,
        };
        return await this.imagesService.createImage(fileEntity);
      }),
    );

    await this.imagesDAO.saveImage(fileEntities);
    return fileEntities;
  }
}
