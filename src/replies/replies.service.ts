import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReplyDto } from './dto/create-reply.dto';
import { IUserWithoutPassword } from '../auth/interfaces/session-decorator.interface';
import { RepliesDAO } from './replies.dao';
import { CommentsDAO } from 'src/comments/comments.dao';
import { RepliesEntity } from './entities/replies.entity';
import { EReportReason, EReportStatus } from 'src/reports/enum';
import { ReportDto } from 'src/posts/dto';
import { ReportedRepliesDAO } from 'src/reports/dao';
import { IReportedReplyResponse } from 'src/reports/interfaces/users';

@Injectable()
export class RepliesService {
  constructor(
    private readonly repliesDAO: RepliesDAO,
    private readonly commentsDAO: CommentsDAO,
    private readonly reportedRepliesDAO: ReportedRepliesDAO,
  ) {}

  // 답글 작성
  async createReply(
    commentId: number,
    sessionUser: IUserWithoutPassword,
    createReplyDto: CreateReplyDto,
  ): Promise<RepliesEntity> {
    const { userId } = sessionUser;
    const comment = await this.commentsDAO.findCommentById(commentId);
    if (!comment) {
      throw new NotFoundException(`${commentId}번 댓글을 찾을 수 없습니다.`);
    }

    const reply = await this.repliesDAO.createReply(createReplyDto, userId, commentId);
    reply.postId = comment.postId;
    const createdReply = await this.repliesDAO.saveReply(reply);

    const content = createdReply.content;
    const summaryContent = content.length > 100 ? content.substring(0, 100) + '...' : content;

    return {
      ...createdReply,
      content: summaryContent,
    };
  }

  // 특정 댓글에 대한 답글 조회
  async getReplies(commentId: number): Promise<RepliesEntity[]> {
    const comment = await this.commentsDAO.findCommentById(commentId, {
      relations: ['replies'],
    });

    if (!comment) {
      throw new NotFoundException(`${commentId}번 댓글을 찾을 수 없습니다.`);
    }

    // 답글을 createdAt 기준으로 오름차순 정렬 (작성순서대로 나와야 함.)
    const replies = comment.replies.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    return replies;
  }

  // 답글 수정
  async updateReply(
    replyId: number,
    sessionUser: IUserWithoutPassword,
    createReplyDto: CreateReplyDto,
  ): Promise<RepliesEntity> {
    const { userId } = sessionUser;
    const reply = await this.repliesDAO.findReplyById(replyId);
    if (!reply) throw new NotFoundException(`${replyId}번 답글을 찾을 수 없습니다.`);

    if (userId !== reply.userId) {
      throw new ForbiddenException(`답글을 수정할 권한이 없습니다.`);
    }

    await this.repliesDAO.updateReply(replyId, createReplyDto);
    const updatedReply = await this.repliesDAO.findReplyById(replyId);

    const content = updatedReply.content;
    const summaryContent = content.length > 100 ? content.substring(0, 100) + '...' : content;

    return {
      ...updatedReply,
      content: summaryContent,
    };
  }

  // 답글 삭제
  async deleteReply(replyId: number, sessionUser: IUserWithoutPassword): Promise<{ message: string }> {
    const { userId } = sessionUser;
    const reply = await this.repliesDAO.findReplyById(replyId);
    if (!reply) throw new NotFoundException(`${replyId}번 답글을 찾을 수 없습니다.`);

    if (userId !== reply.userId) {
      throw new ForbiddenException(`답글을 삭제할 권한이 없습니다.`);
    }

    const result = await this.repliesDAO.deleteReply(replyId);
    if (result.affected === 0) {
      throw new NotFoundException(`답글 삭제 중 에러가 발생하였습니다.`);
    }

    return { message: '답글이 삭제되었습니다.' };
  }

  // 답글 신고
  async reportReply(
    replyId: number,
    sessionUser: IUserWithoutPassword,
    reportDto: ReportDto,
  ): Promise<IReportedReplyResponse> {
    const { userId } = sessionUser;
    const reply = await this.repliesDAO.findReplyById(replyId);
    if (!reply) throw new NotFoundException(`${replyId}번 답글을 찾을 수 없습니다.`);

    if (reply.userId === userId) {
      throw new ForbiddenException(`본인이 작성한 답글은 본인이 신고할 수 없습니다.`);
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

    const existingReport = await this.reportedRepliesDAO.existsReportedReply(replyId, userId);
    if (existingReport) {
      throw new ConflictException(`이미 신고한 답글입니다.`);
    }

    const reportedReplyDto = {
      replyId,
      userId,
      reportedUserId: reply.userId,
      reportedReason: reportDto.reportedReason,
      otherReportedReason: reportDto.otherReportedReason,
      status: EReportStatus.PENDING,
    };

    const result = await this.reportedRepliesDAO.createReplyReport(reportedReplyDto);
    await this.reportedRepliesDAO.saveReportReply(result);

    reply.reportedAt = new Date();
    await this.repliesDAO.saveReply(reply);

    return {
      reportReplyId: result.reportReplyId, // 신고 ID
      replyId: result.replyId, // 신고된 답글 ID
      userId: result.userId, // 신고한 사용자 ID
      reportedUserId: result.reportedUserId, // 신고된 사용자 ID
      reportedReason: result.reportedReason, // 신고 이유
      otherReportedReason: result.otherReportedReason, // 기타 신고 이유
      createdAt: result.createdAt, // 신고 일자
    };
  }
}
