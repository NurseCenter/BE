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
}
