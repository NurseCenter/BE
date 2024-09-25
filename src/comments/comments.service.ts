import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EBoardType } from '../posts/enum/board-type.enum';
import { CreateCommentDto } from './dto/create-comment.dto';
import { IUserWithoutPassword } from '../auth/interfaces/session-decorator.interface';
import { ReportDto } from '../posts/dto/report.dto';
import { EReportReason, EReportStatus } from 'src/reports/enum';
import { PostsDAO } from 'src/posts/posts.dao';
import { CommentsDAO } from './comments.dao';
import { ReportedCommentsDAO } from 'src/reports/dao';
import { IPaginatedResponse } from 'src/common/interfaces';
import { CommentsEntity } from './entities/comments.entity';
import { ReportedCommentDto } from 'src/reports/dto/reported-comment.dto';
import { PaginationQueryDto } from 'src/common/dto';
import { IReportedCommentResponse } from 'src/reports/interfaces/users';

@Injectable()
export class CommentsService {
  constructor(
    private readonly reportedCommentsDAO: ReportedCommentsDAO,
    private readonly postsDAO: PostsDAO,
    private readonly commentsDAO: CommentsDAO,
  ) {}

  // 댓글 작성
  async createComment(
    boardType: EBoardType,
    postId: number,
    sessionUser: IUserWithoutPassword,
    createCommentDto: CreateCommentDto,
  ): Promise<CommentsEntity> {
    const { userId } = sessionUser;
    const post = await this.postsDAO.findPostByIdAndBoardType(postId, boardType);
    if (!post) {
      throw new NotFoundException(`${boardType} 게시판에서 ${postId}번 게시물을 찾을 수 없습니다.`);
    }

    const comment = await this.commentsDAO.createComment(createCommentDto, userId, postId, boardType);
    const createdComment = await this.commentsDAO.saveComment(comment);

    const content = createdComment.content;
    const summaryContent = content.length > 100 ? content.substring(0, 100) + '...' : content;

    return {
      ...createdComment,
      content: summaryContent,
    };
  }

  // 특정 게시물의 모든 댓글 조회 (답글 포함)
  async getCommentsWithRepliesInOnePost(
    boardType: EBoardType,
    postId: number,
    paginationQueryDto: PaginationQueryDto,
  ): Promise<IPaginatedResponse<any>> {
    const { page = 1, limit = 10 } = paginationQueryDto;
    const result = await this.commentsDAO.findCommentsWithReplies(postId, page, limit);

    return {
      items: result.comments,
      totalItems: result.total,
      totalPages: Math.ceil(result.total / limit),
      currentPage: page,
    };
  }

  // 특정 게시물의 모든 댓글 조회
  async getCommentsInOnePost(
    boardType: EBoardType,
    postId: number,
    paginationQueryDto: PaginationQueryDto,
  ): Promise<IPaginatedResponse<CommentsEntity>> {
    const { page = 1, limit = 10 } = paginationQueryDto;
    const result = await this.commentsDAO.findCommentsInOnePost(boardType, postId, page, limit);

    return {
      items: result.comments,
      totalItems: result.total,
      totalPages: Math.ceil(result.total / limit),
      currentPage: page,
    };
  }

  // 댓글 수정
  async updateComment(
    commentId: number,
    updateCommentDto: CreateCommentDto,
    sessionUser: IUserWithoutPassword,
  ): Promise<CommentsEntity> {
    const { userId } = sessionUser;
    const comment = await this.commentsDAO.findCommentById(commentId);
    if (!comment) throw new NotFoundException(`${commentId}번 댓글을 찾을 수 없습니다.`);

    if (userId !== comment.userId) {
      throw new ForbiddenException(`댓글을 수정할 권한이 없습니다.`);
    }

    await this.commentsDAO.updateComment(commentId, updateCommentDto);
    const updatedComment = await this.commentsDAO.findCommentById(commentId);

    const content = updatedComment.content;
    const summaryContent = content.length > 100 ? content.substring(0, 100) + '...' : content;

    return {
      ...updatedComment,
      content: summaryContent,
    };
  }

  // 댓글 삭제
  async deleteComment(commentId: number, sessionUser: IUserWithoutPassword): Promise<{ message: string }> {
    const { userId } = sessionUser;
    const comment = await this.commentsDAO.findCommentById(commentId);
    if (!comment) throw new NotFoundException(`${commentId}번 댓글을 찾을 수 없습니다.`);

    if (userId !== comment.userId) {
      throw new ForbiddenException(`댓글을 삭제할 권한이 없습니다.`);
    }

    const result = await this.commentsDAO.deleteComment(commentId);
    if (result.affected === 0) {
      throw new NotFoundException(`댓글 삭제 중 에러가 발생하였습니다.`);
    }

    return { message: '댓글이 삭제되었습니다.' };
  }

  // 특정 댓글 신고
  async reportComment(
    commentId: number,
    sessionUser: IUserWithoutPassword,
    reportDto: ReportDto,
  ): Promise<IReportedCommentResponse> {
    const { userId } = sessionUser;
    const comment = await this.commentsDAO.findCommentById(commentId);
    if (!comment) throw new NotFoundException(`${commentId}번 댓글을 찾을 수 없습니다.`);

    if (comment.userId === userId) {
      throw new ForbiddenException(`본인이 작성한 댓글은 본인이 신고할 수 없습니다.`);
    }

    if (reportDto.reportedReason === EReportReason.OTHER) {
      if (!reportDto.otherReportedReason) {
        throw new BadRequestException(`신고 사유가 '기타'일 경우, 기타 신고 사유를 기입해주세요.`);
      }
    } else {
      if (reportDto.otherReportedReason) {
        throw new BadRequestException(`신고 사유가 '기타'가 아닐 경우, 기타 신고 사유는 입력할 수 없습니다.`);
      }
    }

    const existingReport = await this.reportedCommentsDAO.existsReportedComment(commentId, userId);

    if (existingReport) {
      throw new ConflictException(`이미 신고한 댓글입니다.`);
    }

    const reportedCommentDto: ReportedCommentDto = {
      commentId,
      userId,
      reportedUserId: comment.userId,
      reportedReason: reportDto.reportedReason,
      otherReportedReason: reportDto.otherReportedReason,
      status: EReportStatus.PENDING,
    };

    const result = await this.reportedCommentsDAO.createCommentReport(reportedCommentDto);
    await this.reportedCommentsDAO.saveReportComment(result);

    comment.reportedAt = new Date();
    await this.commentsDAO.saveComment(comment);

    return {
      reportCommentId: result.reportCommentId, // 신고 ID
      commentId: result.commentId, // 신고된 댓글 ID
      userId: result.userId, // 신고한 사용자 ID
      reportedUserId: result.reportedUserId, // 신고된 사용자 ID
      reportedReason: result.reportedReason, // 신고 이유
      otherReportedReason: result.otherReportedReason, // 기타 신고 이유
      createdAt: result.createdAt, // 신고 일자
    };
  }
}
