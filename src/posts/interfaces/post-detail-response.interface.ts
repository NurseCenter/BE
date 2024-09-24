import { EBoardType } from '../enum/board-type.enum';

export interface IPostDetailResponse {
  postId: number; // 게시물 ID
  category: EBoardType; // 게시판 카테고리
  title: string; // 게시물 제목
  content: string; // 게시물 내용
  hospitalNames: string[]; // 병원 이름
  likeCounts: number; // 좋아요 수
  viewCounts: number; // 조회수
  createdAt: Date; // 작성일
  updatedAt: Date; // 수정일
  isLiked: boolean; // 좋아요 여부
  isScraped: boolean; // 스크랩 여부
  user: any; // 작성자 정보 (회원 ID, 닉네임)
  numberOfComments: number | null; // 댓글과 답글 수
}
