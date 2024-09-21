import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RepliesEntity } from 'src/replies/entities/replies.entity';
import { CreateCommentDto } from 'src/comments/dto/create-comment.dto';

@Injectable()
export class RepliesDAO {
  constructor(
    @InjectRepository(RepliesEntity)
    private readonly repliesRepository: Repository<RepliesEntity>,
  ) {}

  // 답글 ID로 답글 조회
  async findRepliesByReplyId(replyId: number): Promise<RepliesEntity[]> {
    return this.repliesRepository.find({ where: { replyId } });
  }

  // 답글 생성
  async createComment(createReplyDto: CreateCommentDto, userId: number, commentId: number) {
    const reply = this.repliesRepository.create({
      ...createReplyDto,
      userId,
      commentId
    });
    return reply;
  }

  // 답글 ID로 답글 수정
  async updateComment(replyId: number, createCommentDto: CreateCommentDto): Promise<void> {
    await this.repliesRepository.update(replyId, {
      ...createCommentDto,
    });
  }

  // 관리자페이지 모든 답글 조회
  async findAllReplies(): Promise<any[]> {
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
      .where('reply.deletedAt IS NULL')
      .getRawMany();
  }

  // 특정 답글 조회
  async findReplyById(id: number): Promise<any> {
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

  // 댓글 또는 답글 삭제
  async deleteCommentOrReply(id: number): Promise<void> {
    // 답글인지 확인
    const reply = await this.repliesRepository.findOne({
      where: { replyId: id, deletedAt: null },
    });
    if (reply) {
      await this.repliesRepository.update(id, { deletedAt: new Date() });
      return;
    }
  }

  // 답글 삭제
  async deleteReply(replyId: number) {
    return this.repliesRepository.softDelete(replyId);
  }

  // 댓글 저장
  async saveReply(reply: RepliesEntity) {
    return this.repliesRepository.save(reply);
  }
}
