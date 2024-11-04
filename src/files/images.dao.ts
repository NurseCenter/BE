import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DeleteResult } from "typeorm";
import { ImagesEntity } from "./entities/images.entity";

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

  // 이미지 엔티티 삭제 (소프트 삭제)
  async deleteImage(image: ImagesEntity): Promise<DeleteResult> {
    return await this.imagesRepository.softDelete(image);
  }

  // 특정 게시글에 저장된 이미지 URL들 불러오기
  async getImageUrlsInOnePost(postId: number): Promise<string[]> {
    const imageEntities = await this.imagesRepository.find({ where: { postId } });
    return imageEntities.map((imageEntity) => imageEntity.url);
  }

  // 특정 URL에 해당하는 Row 조회하기
  async getOneImageUrl(url: string): Promise<ImagesEntity> {
    return await this.imagesRepository.findOne({ where: { url } });
  }
}