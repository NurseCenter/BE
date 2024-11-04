import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FilesEntity } from '../entities/files.entity';

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
    const fileEntity = await this.filesRepository.findOne({ where: file });
    fileEntity.deletedAt = new Date();
    return await this.filesRepository.save(fileEntity);
  }

  // 특정 게시글에 저장된 파일 URL들 불러오기
  async getFileUrlsInOnePost(postId: number): Promise<IAttachments[]> {
    const fileEntities = await this.filesRepository.find({ where: { postId } });
    return fileEntities.map((fileEntity) => {
      const { url, fileName } = fileEntity;
      return { fileUrl: url, fileName };
    });
  }

  // 특정 URL에 해당하는 Row 조회하기
  async getOneFileUrl(url: string): Promise<FilesEntity> {
    return await this.filesRepository.findOne({ where: { url } });
  }
}
