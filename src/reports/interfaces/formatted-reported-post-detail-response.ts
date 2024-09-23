interface IFormattedReportedPostResponse {
  postAuthor: string; // 작성자
  postDate: Date; // 작성일자 (원 게시물)
  postCategory: string; // 카테고리
  postId: number; // 원 게시물 ID
  postTitle: string; // 게시물 제목
  reporter: string; // 신고자 닉네임
  reportDate: Date; // 신고날짜
  reportId: number; // 신고 테이블에서의 고유 ID
  reportedReason: string; // 신고 사유
  otherReportedReason?: string; // 기타 신고 사유 (선택적)
}
