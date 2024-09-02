import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentsEntity } from './entities/comments.entity';
import { Repository } from 'typeorm';
import { BoardType } from '../posts/enum/boardType.enum';
import { CreateCommentDto } from './dto/create-comment.dto';
import { create } from 'domain';
import { PostsEntity } from '../posts/entities/base-posts.entity';
import { User } from '../auth/interfaces/session-decorator.interface';
import { ReportPostDto } from '../posts/dto/report-post.dto';
import { ESuspensionReason } from '../admin/enums';
import { ReportPostsEntity } from '../admin/entities/report-posts.entity';
import { ReportCommentsEntity } from '../admin/entities/report-comments.entity';

@Injectable()
export class CommentsService {
  @InjectRepository(PostsEntity)
  private postRepository: Repository<PostsEntity>;
  @InjectRepository(CommentsEntity)
  private commentRepository: Repository<CommentsEntity>;
  @InjectRepository(ReportCommentsEntity)
  private reportCommentRepository: Repository<ReportCommentsEntity>;

  //작성
  async createComment(boardType: BoardType, postId: number, sessionUser: User, createCommentDto: CreateCommentDto) {
    const { userId } = sessionUser;
    const post = await this.postRepository.findOne({
      where: {
        postId,
        boardType,
      },
    });
    console.log(post);
    if (!post) throw new NotFoundException(`${boardType} 게시판에서 ${postId}번 게시물을 찾을 수 없습니다.`);
    const result = this.commentRepository.create({
      ...createCommentDto,
      userId,
      postId,
      boardType,
    });
    console.log(result);

    const createdComment = await this.commentRepository.save(result);
    console.log(createdComment);
    return createdComment;
  }
  //조회
  async getComments(boardType: BoardType, postId: number) {
    const comments = await this.commentRepository.find({
      where: {
        // postId,
        boardType,
      },
    });

    return comments;
  }
  //수정
  async updateComment(commentId: number, updateCommentDto: CreateCommentDto, sessionUser: User) {
    const { userId } = sessionUser;
    const comment = await this.commentRepository.findOne({
      where: {
        commentId,
      },
    });
    if (!comment) throw new NotFoundException(`${commentId}번 댓글을 찾을 수 없습니다.`);

    if (userId !== comment.userId) {
      throw new ForbiddenException(`댓글을 수정할 권한이 없습니다.`);
    }
    const updateCommentFields = Object.entries(updateCommentDto).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});
    Object.assign(comment, updateCommentFields);
    const updateComment = await this.commentRepository.save(comment);

    return updateComment;
  }
  //삭제
  async deleteComment(commentId: number, sessionUser: User) {
    const { userId } = sessionUser;
    const comment = await this.commentRepository.findOne({
      where: {
        commentId,
      },
    });
    if (!comment) throw new NotFoundException(`${commentId}번 댓글을 찾을 수 없습니다.`);

    if (userId !== comment.userId) {
      throw new ForbiddenException(`댓글을 수정할 권한이 없습니다.`);
    }
    const deletedComment = await this.commentRepository.softDelete(commentId);

    return deletedComment;
  }
  //특정 댓글 신고
  async reportComment(commentId: number, sessionUser: User, reportPostDto: ReportPostDto) {
    const { userId } = sessionUser;
    console.log(commentId);
    const comment = await this.commentRepository.findOneBy({ commentId });
    console.log(comment);
    if (!comment) throw new NotFoundException(`${commentId}번 댓글을 찾을 수 없습니다.`);
    if (comment.userId === userId) {
      throw new ForbiddenException(`자신이 작성한 댓글을 신고할 수 없습니다.`);
    }
    if (reportPostDto.reportedReason === ESuspensionReason.OTHER && !reportPostDto.otherReportedReason) {
      throw new BadRequestException(`신고 사유를 기입해주세요.`);
    }
    const existingReport = await this.reportCommentRepository.findOne({
      where: {
        commentId,
        userId,
      },
    });
    if (existingReport) {
      throw new ConflictException(`이미 신고한 댓글입니다.`);
    }
    const reportedPostDto = this.reportCommentRepository.create({
      commentId,
      userId,
      ...reportPostDto,
      reportedUserId: comment.userId,
    });
    const result = await this.reportCommentRepository.save(reportedPostDto);

    return result;
  }
}
