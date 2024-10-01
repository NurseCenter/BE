import { PostsEntity } from '../posts/entities/base-posts.entity';
import { FilesDAO } from './files.dao';
import { FilesService } from './files.service';

export class FileUploader {
  constructor(
    private filesService: FilesService,
    private filesDAO: FilesDAO,
  ) {}

  async handleFiles(fileTypes: string[], createdPost: PostsEntity) {
    if (!fileTypes || fileTypes.length === 0) {
      return [];
    }

    const presignedPostData = await Promise.all(
      fileTypes.map(async (fileType) => this.filesService.generatePresignedUrl({ fileType })),
    );

    const fileEntities = await Promise.all(
      presignedPostData.map(async (data) => {
        const fileEntity = {
          url: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${data.key}`,
          post: createdPost,
        };
        return await this.filesService.createFile(fileEntity);
      }),
    );

    await this.filesDAO.saveFile(fileEntities);
    return fileEntities;
  }
}
