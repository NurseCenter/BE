import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EBoardType } from '../posts/enum/board-type.enum';
import { CreateCommentDto } from './dto/create-comment.dto';
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
import { summarizeContent } from 'src/common/utils/summarize.utils';
import { IUser } from 'src/auth/interfaces';
import { RepliesDAO } from 'src/replies/replies.dao';

@Injectable()
export class CommentsService {
  constructor(
    private readonly reportedCommentsDAO: ReportedCommentsDAO,
    private readonly postsDAO: PostsDAO,
    private readonly commentsDAO: CommentsDAO,
    private readonly repliesDAO: RepliesDAO,
  ) {}

  // 댓글 작성
  async createComment(
    boardType: EBoardType,
    postId: number,
    sessionUser: IUser,
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
    const summaryContent = summarizeContent(content);

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

    // 댓글 조회
    const comments = await this.commentsDAO.findCommentsInOnePost(postId);

    // 답글 조회
    const replies = await this.repliesDAO.findRepliesByPostId(postId);

    // 댓글과 각 댓글에 대한 답글 결합
    const combinedResults = comments.map((comment) => {
      const commentReplies = replies.filter((reply) => reply.commentId === comment.commentId);

      return {
        ...comment,
        replies: commentReplies,
      };
    });

    // 삭제된 댓글 중 답글 없는 것만 제외하고, 답글 있는 댓글은 내용을 '삭제된 댓글입니다.'로 변경
    const filteredComments = combinedResults.filter((comment) => {
      const hasReplies = comment?.replies?.length > 0;
      if (comment.deletedAt !== null && !hasReplies) {
        return false;
      }
      if (comment.deletedAt !== null && hasReplies) {
        comment.content = '삭제된 댓글입니다.';
      }
      return true;
    });

    // 전체 댓글 수 (삭제된 댓글 제외)
    const total = combinedResults.filter((comment) => comment.deletedAt === null).length;

    // 페이지네이션 적용
    const skip = (page - 1) * limit;
    const paginatedComments = filteredComments.slice(skip, skip + limit);

    // 정렬 기준 적용
    paginatedComments.sort((a, b) => {
      const dateComparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

      if (dateComparison !== 0) {
        return dateComparison; // 작성순으로 정렬
      }

      // 작성일이 같을 경우: 댓글이 먼저
      return a.type === 'comment' && b.type === 'reply' ? -1 : 1;
    });

    // 총 페이지 수 계산
    const totalPages = Math.ceil(total / limit);

    return {
      items: paginatedComments,
      totalItems: total,
      totalPages: totalPages,
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

    const allComments = await this.commentsDAO.findCommentsInOnePostWithoutDeleted(postId);

    // 페이지네이션 적용
    const totalItems = allComments.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedComments = allComments.slice(startIndex, endIndex);
    const totalPages = Math.ceil(totalItems / limit);

    return {
      items: paginatedComments,
      totalItems,
      totalPages,
      currentPage: page,
    };
  }

  // 댓글 수정
  async updateComment(
    commentId: number,
    updateCommentDto: CreateCommentDto,
    sessionUser: IUser,
  ): Promise<CommentsEntity> {
    const { userId } = sessionUser;
    const comment = await this.commentsDAO.findCommentById(commentId);
    if (!comment) throw new NotFoundException(`${commentId}번 댓글을 찾을 수 없습니다.`);

    if (userId !== comment.userId) {
      throw new ForbiddenException(`댓글을 수정할 권한이 없습니다.`);
    }

    // 댓글 내용 변경 여부 확인
    const contentChanged = comment.content !== updateCommentDto.content;

    // 댓글 내용이 변경된 경우
    if (contentChanged) {
      comment.updatedAt = new Date();
      comment.content = updateCommentDto.content;
    }

    await this.commentsDAO.updateComment(commentId, updateCommentDto);

    const updatedComment = await this.commentsDAO.findCommentById(commentId);

    const content = updatedComment.content;
    const summaryContent = summarizeContent(content);

    await this.commentsDAO.saveComment(comment);

    return {
      ...updatedComment,
      content: summaryContent,
    };
  }

  // 댓글 삭제
  async deleteComment(commentId: number, sessionUser: IUser): Promise<{ message: string }> {
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
  async reportComment(commentId: number, sessionUser: IUser, reportDto: ReportDto): Promise<IReportedCommentResponse> {
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
