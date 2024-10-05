import { EReportStatus } from '../../enum';

export interface IUpdateStatusResponse {
  message: string; // 응답 메시지
  reportId: number; // 신고 테이블 고유 ID
  postId?: number; // 게시물 ID
  commentId?: number; // 댓글 ID
  replyId?: number; // 답글 ID
  status: EReportStatus; // 처리상태
}
