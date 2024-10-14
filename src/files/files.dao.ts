import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { FilesEntity } from './entities/files.entity';

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
  async saveFile(files: FilesEntity): Promise<FilesEntity> {
    return await this.filesRepository.save(files);
  }

  // 파일 엔티티 삭제
  async deleteFile(files: FilesEntity): Promise<DeleteResult> {
    return await this.filesRepository.softDelete(files);
  }

  // 특정 게시글에 저장된 파일 URL들 불러오기
  async getFileUrlsInOnePost(postId: number): Promise<string[]> {
    const fileEntities = await this.filesRepository.find({ where: { postId } });
    return fileEntities.map((fileEntity) => fileEntity.url);
  }

  // 특정 URL에 해당하는 Row 조회하기
  async getOneFileUrl(url: string): Promise<FilesEntity> {
    return await this.filesRepository.findOne({ where: { url } });
  }
}
