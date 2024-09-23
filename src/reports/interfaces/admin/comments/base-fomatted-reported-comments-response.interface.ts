export interface IBaseFormattedReportedCommentResponse {
  commentAuthor: string; // 댓글 작성자 닉네임
  commentDate: Date; // 작성일자 (원 댓글)
  postCategory: string; // 게시판 카테고리
  postId: number; // 원 게시물 ID
  postTitle: string; // 게시물 제목
  commentContent: string; // 댓글 내용
  reporter: string; // 신고자 닉네임
  reportDate: Date; // 신고일자
  reportId?: number; // 신고 테이블에서의 고유 ID
  reportedReason: string; // 신고 사유
  otherReportedReason?: string | null; // 기타 신고 사유
}
