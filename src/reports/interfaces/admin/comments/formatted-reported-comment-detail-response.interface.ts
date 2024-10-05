import { IBaseFormattedReportedCommentResponse } from './base-fomatted-reported-comments-response.interface';

export interface IFormattedReportedCommentResponse extends IBaseFormattedReportedCommentResponse {
  commentId?: number; // 댓글 ID
}
