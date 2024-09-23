import { EReportStatus } from 'src/reports/enum';
import { ECommentType } from 'src/users/enums';
import { IBaseFormattedReportedCommentResponse } from './base-fomatted-reported-comments-response.interface';

export interface IFormattedReportedCommentsResponse extends IBaseFormattedReportedCommentResponse {
  type: ECommentType; // 댓글 유형
  reportId: number; // 신고된 댓글 테이블에서의 고유 ID
  commentId: number; // 댓글 ID
  status: EReportStatus; // 신고 처리 상태
}
