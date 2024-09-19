import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImagesEntity } from './entities/image.entity';

@Injectable()
export class ImagesDAO {
  constructor(
    @InjectRepository(ImagesEntity)
    private readonly imageRepository: Repository<ImagesEntity>,
  ) {}

  // 이미지 엔티티 생성
  createImage(image: Partial<ImagesEntity>): ImagesEntity {
    return this.imageRepository.create(image);
  }

  // 이미지 저장
  async saveImage(images: ImagesEntity[]): Promise<ImagesEntity[]> {
    return await this.imageRepository.save(images);
  }
}
