import { EReportReason } from '../../enum';

export interface IReportedPostResponse {
  reportPostId: number; // 신고 ID
  postId: number; // 신고된 게시물 ID
  userId: number; // 신고한 사용자 ID
  reportedUserId: number; // 신고된 사용자 ID
  reportedReason: EReportReason; // 신고 이유
  otherReportedReason?: string | null; // 기타 신고 이유
  createdAt: Date; // 신고 일자
}
