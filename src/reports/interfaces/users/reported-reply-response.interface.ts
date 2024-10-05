import { IReportedCommentResponse } from './reported-comment-response.interface';

export interface IReportedReplyResponse extends Omit<IReportedCommentResponse, 'reportCommentId' | 'commentId'> {
  reportReplyId: number; // 신고 ID
  replyId: number; // 신고된 답글 ID
}
