import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostsEntity } from '../posts/entities/base-posts.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { ScrapsEntity } from './entities/scraps.entity';
import { User } from '../auth/interfaces/session-decorator.interface';

@Injectable()
export class ScrapService {
  @InjectRepository(PostsEntity)
  private postRepository: Repository<PostsEntity>;
  @InjectRepository(ScrapsEntity)
  private scrapRepository: Repository<ScrapsEntity>;

  async scrapPost(postId: number, sessionUser: User): Promise<ScrapsEntity> {
    const { userId } = sessionUser;
    const post = await this.postRepository.findOneBy({ postId });
    if (!post) throw new NotFoundException(`${postId}번 게시글을 찾을 수 없습니다`);

    const isAlreadyScraped = await this.scrapRepository.exists({ where: { userId, postId } });

    if (isAlreadyScraped) throw new ConflictException(`이미 ${postId}번 게시글을 스크랩했습니다.`);

    const scrapedPost = this.scrapRepository.create({ userId, postId });

    const result = await this.scrapRepository.save(scrapedPost);

    return result;
  }

  async getScrapPosts(sessionUser: User) {
    const { userId } = sessionUser;
    return await this.scrapRepository.find({ where: { userId }, relations: ['post'] });
  }

  async deleteScrapPost(scrapId: number, sessionUser: User): Promise<DeleteResult> {
    const { userId } = sessionUser;
    const scrapPost = await this.scrapRepository.findOneBy({ scrapId });

    if (!scrapPost) throw new NotFoundException(`스크랩한 게시물을 찾을 수 없습니다.`);

    if (scrapPost.userId !== userId) throw new ForbiddenException(`삭제한 권한이 없습니다.`);

    const result = await this.scrapRepository.delete({ scrapId });

    return result;
  }
}
