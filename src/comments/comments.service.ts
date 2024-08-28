import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentsEntity } from './entities/comments.entity';
import { Repository } from 'typeorm';
import { RepositoryService } from '../repository/repository.service';
import { BoardType } from '../posts/enum/boardType.enum';
import { CreateCommentDto } from './dto/create-comment.dto';
import { EmploymentEntity } from '../posts/entities/employment.entity';
import { create } from 'domain';

@Injectable()
export class CommentsService {
  @InjectRepository(CommentsEntity)
  private commentRepository: Repository<CommentsEntity>;
  constructor(private repositoryService: RepositoryService) {}

  //작성
  async createComment(
    boardType: BoardType,
    postId: number,
    userId: number,
    createCommentDto: CreateCommentDto,
  ) {
    const repository = this.repositoryService.getRepository(boardType);
    const post = await repository.findOne({
      where: {
        postId,
      },
    });
    if (!post)
      throw new NotFoundException(
        `${boardType} 게시판에서 ${postId}번 게시물을 찾을 수 없습니다.`,
      );
    const result = this.commentRepository.create({
      ...createCommentDto,
      userId,
      postId,
      boardType,
    });

    const createdComment = await this.commentRepository.save(result);
    return createdComment;
  }
  //조회
  async getComments(boardType: BoardType, postId: number) {
    const comments = await this.commentRepository.find({
      where: {
        postId,
        boardType,
      },
    });

    return comments;
  }
  //수정
  async updateComment(
    commentId: number,
    updateCommentDto: CreateCommentDto,
    userId: number,
  ) {
    const comment = await this.commentRepository.findOne({
      where: {
        commentId,
      },
    });
    if (!comment)
      throw new NotFoundException(`${commentId}번 댓글을 찾을 수 없습니다.`);

    if (userId !== comment.userId) {
      throw new ForbiddenException(`댓글을 수정할 권한이 없습니다.`);
    }
    const updateCommentFields = Object.entries(updateCommentDto).reduce(
      (acc, [key, value]) => {
        if (value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      },
      {},
    );
    Object.assign(comment, updateCommentFields);
    const updateComment = await this.commentRepository.save(comment);

    return updateComment;
  }
  //삭제
  async deleteComment(commentId: number, userId: number) {
    const comment = await this.commentRepository.findOne({
      where: {
        commentId,
      },
    });
    if (!comment)
      throw new NotFoundException(`${commentId}번 댓글을 찾을 수 없습니다.`);

    if (userId !== comment.userId) {
      throw new ForbiddenException(`댓글을 수정할 권한이 없습니다.`);
    }
    const deletedComment = await this.commentRepository.softDelete(commentId);

    return deletedComment;
  }
}
