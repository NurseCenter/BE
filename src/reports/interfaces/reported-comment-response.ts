import { EReportReason } from '../enum';

export interface IReportedCommentResponse {
  reportId: number; // 신고 ID
  commentId: number; // 신고된 댓글 ID
  userId: number; // 신고한 사용자 ID
  reportedUserId: number; // 신고된 사용자 ID
  reportedReason: EReportReason; // 신고 이유
  otherReportedReason?: string; // 기타 신고 이유 (선택적)
  createdAt: Date; // 신고 일자
}
