import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImagesEntity } from '../entities/images.entity';
import { winstonLogger } from 'src/config/logger.config';

@Injectable()
export class ImagesDAO {
  constructor(
    @InjectRepository(ImagesEntity)
    private readonly imagesRepository: Repository<ImagesEntity>,
  ) {}

  // 이미지 엔티티 생성
  createImage(image: Partial<ImagesEntity>): ImagesEntity {
    return this.imagesRepository.create(image);
  }

  // 이미지 엔티티 저장
  async saveImage(image: ImagesEntity): Promise<ImagesEntity> {
    return await this.imagesRepository.save(image);
  }

  // 이미지 엔티티 삭제
  async deleteImage(image: ImagesEntity): Promise<ImagesEntity> {
    const ImageEntity = await this.imagesRepository.findOne({ where: image });
    ImageEntity.deletedAt = new Date();
    return await this.imagesRepository.save(image);
  }

  // 여러 개의 이미지 엔티티 삭제
  async deleteImages(urls: string[]): Promise<void> {
    if (urls.length === 0) {
      winstonLogger.error("삭제할 이미지 URL이 없습니다.");
      return;
    }
  
    await this.imagesRepository
      .createQueryBuilder()
      .update(ImagesEntity)
      .set({ deletedAt: new Date() })
      .where('url IN (:...urls)', { urls })
      .execute();
  }

  // 특정 게시글에 저장된 이미지 URL들 불러오기
  async getImageUrlsInOnePost(postId: number): Promise<string[]> {
    const imageEntities = await this.imagesRepository.find({ where: { postId } });
    return imageEntities.map((imageEntity) => imageEntity.url);
  }
}
