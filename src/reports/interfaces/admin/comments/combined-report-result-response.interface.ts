import { EReportReason, EReportStatus } from 'src/reports/enum';
import { ECommentType } from 'src/users/enums';

export interface ICombinedReportResultResponse {
  type: ECommentType; // comment 혹은 reply
  reportId: number; // 신고 테이블 고유 ID
  commentId: number; // 댓글 ID
  replyId?: number; // 답글 ID (답글일 경우, 댓글 및 답글 ID 모두 조회됨)
  commentContent: string; // 댓글 혹은 답글 내용
  commentAuthor: string; // 댓글 작성자 ID
  reportDate: Date; // 신고일자
  reporter: string; // 신고한 사람 닉네임
  reportReason: EReportReason; // 신고 사유
  otherReportedReason: string | null; // 기타 신고사유
  status: EReportStatus; // 신고처리 상태
}
