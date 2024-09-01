import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostsEntity } from '../posts/entities/base-posts.entity';
import { Repository } from 'typeorm';
import { ScrapsEntity } from './entities/scraps.entity';

@Injectable()
export class ScrapService {
  @InjectRepository(PostsEntity)
  private postRepository: Repository<PostsEntity>;
  @InjectRepository(ScrapsEntity)
  private scrapRepository: Repository<ScrapsEntity>;

  async scrapPost(postId: number, userId: number) {
    const post = await this.postRepository.findOneBy({ postId });
    if (!post) throw new NotFoundException(`${postId}번 게시글을 찾을 수 없습니다`);

    const scrapedPost = this.scrapRepository.create({ userId, postId });

    const result = await this.scrapRepository.save(scrapedPost);

    return result;
  }

  async getScrapPosts(userId: number) {
    const result = await this.scrapRepository.find({ where: { userId } });
    return result;
  }
  async deleteScrapPost(scrapId: number, userId: number) {
    const scrapPost = await this.scrapRepository.findOneBy({ scrapId });

    if (!scrapPost) throw new NotFoundException(`스크랩한 게시물을 찾을 수 없습니다.`);
    if (scrapPost.userId !== userId) throw new ForbiddenException(`삭제한 권한이 없습니다.`);
    const result = await this.scrapRepository.softDelete({ scrapId });

    return result;
  }
}
