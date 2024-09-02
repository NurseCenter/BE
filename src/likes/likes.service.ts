import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostsEntity } from '../posts/entities/base-posts.entity';
import { DataSource, getConnection, Like, Repository } from 'typeorm';
import { LikeEntity } from './entities/likes.entity';
import { User } from '../auth/interfaces/session-decorator.interface';

@Injectable()
export class LikesService {
  constructor(private dataSource: DataSource) {}
  @InjectRepository(PostsEntity)
  private postRepository: Repository<PostsEntity>;
  @InjectRepository(LikeEntity)
  private likeRepository: Repository<LikeEntity>;

  async toggleLike(postId: number, sessionUser: User) {
    const { userId } = sessionUser;
    const post = await this.postRepository.findOneBy({ postId });
    console.log(post);
    if (!post) throw new NotFoundException(`${postId}번 게시글을 찾을 수 없습니다`);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction();

    try {
      const existingLike = await this.likeRepository.findOne({ where: { userId, postId } });
      let action: 'liked' | 'unliked';
      if (existingLike) {
        await queryRunner.manager.remove(LikeEntity, existingLike);
        await queryRunner.manager.decrement(PostsEntity, { postId }, 'like', 1);
        await queryRunner.commitTransaction();
        action = 'unliked';
      } else {
        const newLike = queryRunner.manager.create(LikeEntity, { userId, postId });
        await queryRunner.manager.save(newLike);
        await queryRunner.manager.increment(PostsEntity, { postId }, 'like', 1);
        await queryRunner.commitTransaction();
        action = 'liked';
      }
      return {
        success: true,
        action,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      queryRunner.release;
    }
  }
}
