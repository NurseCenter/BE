import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostsEntity } from '../posts/entities/base-posts.entity';
import { DataSource, Repository } from 'typeorm';
import { LikesEntity } from './entities/likes.entity';
import { IUserWithoutPassword } from '../auth/interfaces/session-decorator.interface';
import { ILikeActionResponse } from './interfaces/like-action-response.interface';
import { LikesDAO } from './likes.dao';
import { PostsMetricsService } from 'src/posts/metrics/posts-metrics.service';

@Injectable()
export class LikesService {
  constructor(private dataSource: DataSource) {}
  @InjectRepository(PostsEntity)
  private postRepository: Repository<PostsEntity>;
  private readonly likesDAO: LikesDAO;
  private readonly postsMetricsService: PostsMetricsService;

  async toggleLike(postId: number, sessionUser: IUserWithoutPassword): Promise<ILikeActionResponse> {
    const { userId } = sessionUser;
    const post = await this.postRepository.findOneBy({ postId });
    if (!post) throw new NotFoundException(`${postId}번 게시글을 찾을 수 없습니다`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingLike = await this.likesDAO.checkIfLiked(userId, postId);

      if (existingLike) {
        const likeToRemove = await this.likesDAO.getLikeByUserIdAndPostId(userId, postId);
        await queryRunner.manager.remove(LikesEntity, likeToRemove);
        await this.postsMetricsService.decrementLikeCount(postId);
      } else {
        const newLike = queryRunner.manager.create(LikesEntity, { userId, postId });
        await queryRunner.manager.save(newLike);
        await this.postsMetricsService.incrementLikeCount(postId);
      }

      await queryRunner.commitTransaction();
      return { success: true, action: existingLike ? 'unliked' : 'liked' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
