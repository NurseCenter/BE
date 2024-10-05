export interface IScrapedPostResponse {
  scrapId?: number; // 스크랩 ID
  postId: number; // 게시물 ID
  boardType: string; // 게시판 카테고리
  title: string; // 게시물 제목
  viewCounts: number; // 조회수
  likeCounts: number; // 좋아요수
  createdAt: Date; // 작성일
}
