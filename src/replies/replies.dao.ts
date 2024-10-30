import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { RepliesEntity } from 'src/replies/entities/replies.entity';
import { CreateCommentDto } from 'src/comments/dto/create-comment.dto';
import { summarizeContent } from 'src/common/utils/summarize.utils';
import { ESearchCommentByAdmin } from 'src/admin/enums';

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

  // 답글 ID로 답글 조회 (삭제된 답글 포함)
  async findReplyByIdWithDeletedReply(replyId: number): Promise<RepliesEntity | undefined> {
    return this.repliesRepository.findOne({
      where: {
        replyId,
      },
    });
  }

  // 답글 ID로 답글 내용 조회 (100자 이상이면 축약)
  async findReplyContentByReplyId(replyId: number): Promise<string> {
    const { content } = await this.repliesRepository.findOne({
      where: { replyId },
    });

    const summaryContent = summarizeContent(content);

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
  async findAllReplies(type: ESearchCommentByAdmin, search: string): Promise<any[]> {
    const queryBuilder = this.repliesRepository
      .createQueryBuilder('reply')
      .leftJoinAndSelect('reply.user', 'replyUser')
      .select([
        'reply.replyId', // 답글 ID
        'reply.content', // 답글 내용
        'reply.createdAt', // 작성일
        'replyUser.nickname', // 답글 작성자 닉네임
      ])
      .where('reply.deletedAt IS NULL');

    if (type && search) {
      switch (type) {
        case ESearchCommentByAdmin.COMMENT_ID:
          queryBuilder.andWhere('reply.replyId = :search', { search });
          break;
        case ESearchCommentByAdmin.COMMENT_CONTENT:
          queryBuilder.andWhere('reply.content LIKE :search', { search: `%${search}%` });
          break;
        case ESearchCommentByAdmin.COMMENT_AUTHOR:
          queryBuilder.andWhere('replyUser.nickname LIKE :search', { search: `%${search}%` });
          break;
      }
    }

    const results = await queryBuilder.getMany();
    // console.log('댓글 조회 결과:', results);
    return results;
  }

  // 특정 게시물의 모든 답글 조회
  async findRepliesByPostId(postId: number): Promise<any[]> {
    return await this.repliesRepository.find({ where: { postId, deletedAt: null } });
  }

  // 특정 댓글의 모든 답글 조회
  async findRepliesByCommentId(commentId: number): Promise<any[]> {
    return await this.repliesRepository
      .createQueryBuilder('reply')
      .leftJoinAndSelect('reply.user', 'user')
      .where('reply.commentId = :commentId AND reply.deletedAt IS NULL', { commentId })
      .select([
        'reply.replyId AS replyId',
        'reply.content AS content',
        'reply.createdAt AS createdAt',
        'reply.updatedAt AS updatedAt',
        'user.userId AS userId',
        'user.nickname AS nickname',
      ])
      .orderBy('reply.createdAt', 'ASC')
      .getRawMany();
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
      .innerJoinAndSelect('reply.post', 'post')
      .where('reply.userId = :userId', { userId })
      .andWhere('reply.deletedAt IS NULL')
      .andWhere('post.deletedAt IS NULL') // 삭제되지 않은 게시물의 댓글만 조회
      .skip(skip)
      .take(take)
      .getManyAndCount();

    return [replies, count];
  }

  // 답글 삭제
  async deleteReply(replyId: number): Promise<DeleteResult> {
    return this.repliesRepository.softDelete(replyId);
  }

  // 여러 답글 삭제
  async deleteReplies(replyIds: number[]): Promise<{ affected: number; alreadyDeletedIds: number[] }> {
    let affectedCount = 0;
    const alreadyDeletedIds: number[] = [];

    for (const replyId of replyIds) {
      const reply = await this.repliesRepository.findOne({ where: { replyId } });

      if (!reply || reply.deletedAt !== null) {
        alreadyDeletedIds.push(replyId);
        continue;
      }

      reply.deletedAt = new Date();
      await this.repliesRepository.save(reply);
      affectedCount++;
    }

    return { affected: affectedCount, alreadyDeletedIds };
  }

  // 답글 저장
  async saveReply(reply: RepliesEntity): Promise<RepliesEntity> {
    return this.repliesRepository.save(reply);
  }

  // 특정 게시물에 달린 답글 수 구하기
  async countAllrepliesByPostId(postId: number): Promise<number> {
    return this.repliesRepository
      .createQueryBuilder('comment')
      .where('comment.postId = :postId', { postId })
      .andWhere('comment.deletedAt IS NULL')
      .getCount();
  }
}
