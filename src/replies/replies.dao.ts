import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { RepliesEntity } from 'src/replies/entities/replies.entity';
import { CreateCommentDto } from 'src/comments/dto/create-comment.dto';

@Injectable()
export class RepliesDAO {
  constructor(
    @InjectRepository(RepliesEntity)
    private readonly repliesRepository: Repository<RepliesEntity>,
  ) {}

  // 답글 ID로 답글 조회
  async findReplyById(replyId: number): Promise<RepliesEntity | undefined> {
    return this.repliesRepository.findOne({
      where: {
        replyId,
        deletedAt: null,
      },
    });
  }

  // 답글 ID로 답글 내용 조회 (100자 이상이면 축약)
  async findReplyContentByReplyId(replyId: number): Promise<string> {
    const { content } = await this.repliesRepository.findOne({
      where: { replyId },
    });

    const summaryContent = content.length > 100 ? content.substring(0, 100) + '...' : content;

    return summaryContent;
  }

  // 답글 생성
  async createReply(createReplyDto: CreateCommentDto, userId: number, commentId: number): Promise<RepliesEntity> {
    const reply = this.repliesRepository.create({
      ...createReplyDto,
      userId,
      commentId,
    });
    return reply;
  }

  // 답글 ID로 답글 수정
  async updateReply(replyId: number, createCommentDto: CreateCommentDto): Promise<void> {
    await this.repliesRepository.update(replyId, {
      ...createCommentDto,
    });
  }

  // 관리자페이지 모든 답글 조회
  async findAllReplies(): Promise<any[]> {
    return this.repliesRepository
      .createQueryBuilder('reply')
      .leftJoinAndSelect('reply.user', 'user')
      .select([
        'reply.replyId', // 답글 ID
        'reply.content', // 답글 내용
        'reply.createdAt', // 작성일
        'user.nickname', // 작성자 닉네임
      ])
      .where('reply.deletedAt IS NULL')
      .getMany();
  }

  // 특정 답글 조회
  async findReply(id: number): Promise<any> {
    return this.repliesRepository
      .createQueryBuilder('reply')
      .leftJoinAndSelect('reply.user', 'user')
      .leftJoinAndSelect('reply.post', 'post')
      .select([
        'reply.replyId', // 답글 ID
        'reply.content', // 답글 내용
        'reply.createdAt', // 작성일
        'user.nickname', // 작성자 닉네임
        'post.title', // 게시물 제목
        'post.boardType', // 게시물 카테고리
      ])
      .where('reply.replyId = :id AND reply.deletedAt IS NULL', { id })
      .getRawOne();
  }

  // 특정 회원이 쓴 답글 조회
  async findRepliesByUserIdWithPagination(
    userId: number,
    skip: number,
    take: number,
  ): Promise<[RepliesEntity[], number]> {
    const [replies, count] = await this.repliesRepository
      .createQueryBuilder('reply')
      .where('reply.userId = :userId', { userId })
      .andWhere('reply.deletedAt IS NULL')
      .skip(skip)
      .take(take)
      .getManyAndCount();

    return [replies, count];
  }

  // 답글 삭제
  async deleteReply(replyId: number): Promise<DeleteResult> {
    return this.repliesRepository.softDelete(replyId);
  }

  // 답글 저장
  async saveReply(reply: RepliesEntity): Promise<RepliesEntity> {
    return this.repliesRepository.save(reply);
  }

  // 특정 게시물에 달린 댓글 수 구하기
  async countAllrepliesByPostId(postId: number): Promise<number> {
    return this.repliesRepository.count({ where: { postId, deletedAt: null } });
  }
}
