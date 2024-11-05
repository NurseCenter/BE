import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FilesEntity } from '../entities/files.entity';
import { IAttachments } from '../interfaces/attachments.interface';
import { winstonLogger } from 'src/config/logger.config';

@Injectable()
export class FilesDAO {
  constructor(
    @InjectRepository(FilesEntity)
    private readonly filesRepository: Repository<FilesEntity>,
  ) {}

  // 파일 엔티티 생성
  createFile(file: Partial<FilesEntity>): FilesEntity {
    return this.filesRepository.create(file);
  }

  // 파일 엔티티 저장
  async saveFile(file: FilesEntity): Promise<FilesEntity> {
    return await this.filesRepository.save(file);
  }

  // 파일 엔티티 삭제
  async deleteFile(file: FilesEntity): Promise<FilesEntity> {
    const fileEntity = await this.filesRepository.findOne({ where: { fileId: file.fileId } });
    fileEntity.deletedAt = new Date();
    return await this.filesRepository.save(fileEntity);
  }

  // 여러 개의 파일 엔티티 삭제
  async deleteFiles(urls: string[]): Promise<void> {
    if (urls.length === 0) {
      winstonLogger.error('삭제할 첨부파일 URL이 없습니다.');
      return;
    }

    await this.filesRepository
      .createQueryBuilder()
      .update(FilesEntity)
      .set({ deletedAt: new Date() })
      .where('url IN (:...urls)', { urls })
      .execute();
  }

  // 특정 게시글에 저장된 파일 URL들 불러오기
  async getFileUrlsInOnePost(postId: number): Promise<IAttachments[]> {
    const fileEntities = await this.filesRepository.find({ where: { postId } });
    return fileEntities.map((fileEntity) => {
      const { url, fileName } = fileEntity;
      return { fileUrl: url, fileName };
    });
  }
}
