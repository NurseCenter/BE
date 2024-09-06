import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RepliesEntity } from 'src/replies/entities/replies.entity';
import { Repository } from 'typeorm';
import { CommentsEntity } from './entities/comments.entity';

@Injectable()
export class CommentsDAO {
  constructor(
    @InjectRepository(CommentsEntity)
    private readonly commentsRepository: Repository<CommentsEntity>,
    @InjectRepository(RepliesEntity)
    private readonly repliesRepository: Repository<RepliesEntity>,
  ) {}

   // 본인이 쓴 댓글 및 답글 조회
   async findMyComments(
    userId: number,
    page: number,
    limit: number,
    sort: 'latest' | 'popular'
  ) {
    const skip = (page - 1) * limit;

    const commentsQuery = this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.post', 'post')
      .where('comment.userId = :userId', { userId })
      .andWhere('comment.deletedAt IS NULL')
      .orderBy(
        // 최신순일 경우 댓글의 작성일(createdAt)로 정렬, 인기순일 경우 게시물의 스크랩 수(scrapCounts)로 정렬
        // 정렬 방향: 최신순일 경우 최신 댓글이 위로 오도록 내림차순, 인기순일 경우 스크랩 수가 많은 게시물이 위로 오도록 내림차순
        sort === 'latest' ? 'comment.createdAt' : 'post.scrapCounts', 
        sort === 'latest' ? 'DESC' : 'DESC')
      .skip(skip)
      .take(limit);

    const repliesQuery = this.repliesRepository
      .createQueryBuilder('reply')
      .leftJoinAndSelect('reply.comments', 'comment')
      .leftJoinAndSelect('comment.post', 'post')
      .where('reply.userId = :userId', { userId })
      .andWhere('reply.deletedAt IS NULL')
      .orderBy(
        sort === 'latest' ? 'reply.createdAt' : 'post.scrapCounts', 
        sort === 'latest' ? 'DESC' : 'DESC')
      .skip(skip)
      .take(limit);

    const [comments, replies] = await Promise.all([commentsQuery.getMany(), repliesQuery.getMany()]);

    const commentsAndReplies = [...comments, ...replies];
    const totalItems = commentsAndReplies.length;

    return {
      items: commentsAndReplies.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    };
  }

  // 모든 댓글 조회
  async findAllComments(): Promise<any[]> {
    return this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.post', 'post')
      .select([
        'comment.commentId', // 댓글 ID (렌더링 X)
        'comment.content', // 댓글 내용
        'comment.createdAt', // 작성일
        'user.nickname', // 작성자 닉네임,
        'post.title', // 게시물 제목
        'post.boardType', // 게시물 카테고리
      ])
      .where('comment.deletedAt IS NULL')
      .getRawMany();
  }

  // 특정 댓글 조회
  async findCommentById(id: number): Promise<any> {
    return this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.post', 'post')
      .select([
        'comment.commentId', // 댓글 ID
        'comment.content', // 댓글 내용
        'comment.createdAt', // 작성일
        'user.nickname', // 작성자 닉네임
        'post.title', // 게시물 제목
        'post.boardType', // 게시물 카테고리
      ])
      .where('comment.commentId = :id AND comment.deletedAt IS NULL', { id })
      .getRawOne();
  }

  // 댓글 또는 답글 삭제
  async deleteCommentOrReply(id: number): Promise<void> {
    // 댓글인지 확인
    const comment = await this.commentsRepository.findOne({
      where: { commentId: id, deletedAt: null },
    });

    if (comment) {
      // 댓글 삭제
      await this.commentsRepository.update(id, { deletedAt: new Date() });
      return;
    }

    // 답글인지 확인
    const reply = await this.repliesRepository.findOne({
      where: { replyId: id, deletedAt: null },
    });

    if (reply) {
      // 답글 삭제
      await this.repliesRepository.update(id, { deletedAt: new Date() });
      return;
    }

    // 댓글도 답글도 아닌 경우
    throw new Error('댓글 또는 답글을 찾을 수 없습니다.');
  }
}
