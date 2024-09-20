import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LikesEntity } from './entities/likes.entity';

@Injectable()
export class LikesDAO {
  constructor(
    @InjectRepository(LikesEntity)
    private readonly likesRepository: Repository<LikesEntity>,
  ) {}

  // 특정 좋아요 내역을 불러오기
  async getLikeByUserIdAndPostId(userId: number, postId: number): Promise<LikesEntity | null> {
    return this.likesRepository.findOne({ where: { userId, postId } });
  }

  // 좋아요 눌렀는지 확인하기
  async checkIfLiked(userId: number, postId: number): Promise<boolean> {
    return this.likesRepository.exists({ where: { userId, postId } });
  }
}
