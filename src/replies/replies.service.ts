import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentsEntity } from '../comments/entities/comments.entity';
import { RepliesEntity } from './entities/replies.entity';
import { Repository } from 'typeorm';
import { ReplyDto } from './dto/reply.dto';
import { User } from '../auth/interfaces/session-decorator.interface';

@Injectable()
export class RepliesService {
  @InjectRepository(CommentsEntity)
  private commentRepository: Repository<CommentsEntity>;
  @InjectRepository(RepliesEntity)
  private replyRepository: Repository<RepliesEntity>;

  //작성
  async createReply(commentId: number, sessionUser: User, replyDto: ReplyDto) {
    const { userId } = sessionUser;
    const post = await this.commentRepository.findOne({
      where: {
        commentId,
      },
    });
    if (!post) throw new NotFoundException(`${commentId}번 댓글을 찾을 수 없습니다.`);
    const result = this.replyRepository.create({
      ...replyDto,
      userId,
      commentId,
    });

    const createdComment = await this.replyRepository.save(result);
    return createdComment;
  }
  //조회
  async getReplies(commentId: number) {
    const comments = await this.replyRepository.find({
      where: {
        commentId,
      },
    });

    return comments;
  }
  //수정
  async updateReplies(replyId: number, sessionUser: User, replyDto: ReplyDto) {
    const { userId } = sessionUser;
    const reply = await this.replyRepository.findOne({
      where: {
        replyId,
      },
    });
    if (!reply) throw new NotFoundException(`${replyId}번 댓글을 찾을 수 없습니다.`);

    if (userId !== reply.userId) {
      throw new ForbiddenException(`댓글을 수정할 권한이 없습니다.`);
    }
    const updateCommentFields = Object.entries(replyDto).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});
    Object.assign(reply, updateCommentFields);
    const updateComment = await this.replyRepository.save(reply);
    return updateComment;
  }
  //삭제
  async deleteReplies(replyId: number, sessionUser: User) {
    const { userId } = sessionUser;
    const reply = await this.replyRepository.findOne({
      where: {
        replyId,
      },
    });
    if (!reply) throw new NotFoundException(`${replyId}번 댓글을 찾을 수 없습니다.`);

    if (userId !== reply.userId) {
      throw new ForbiddenException(`댓글을 수정할 권한이 없습니다.`);
    }
    const deletedComment = await this.replyRepository.softDelete(replyId);

    return deletedComment;
  }
}
