import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FilesEntity } from './entities/files.entity';

@Injectable()
export class FilesDAO {
  constructor(
    @InjectRepository(FilesEntity)
    private readonly filesRepository: Repository<FilesEntity>,
  ) {}

  // 이미지 엔티티 생성
  createFile(file: Partial<FilesEntity>): FilesEntity {
    return this.filesRepository.create(file);
  }

  // 이미지 저장
  async saveFile(files: FilesEntity[]): Promise<FilesEntity[]> {
    return await this.filesRepository.save(files);
  }
}
