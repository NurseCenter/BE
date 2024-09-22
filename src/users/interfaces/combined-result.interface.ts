import { ECommentType } from "../enums";

export interface ICombinedResult {
  type: ECommentType; // comment 혹은 reply
  commentId: number; // 댓글 ID
  replyId?: number; // 답글 ID (답글일 경우, 댓글 및 답글 ID 모두 조회됨)
  content: string; // 내용
  createdAt: Date; // 댓글 또는 답글의 작성일
  postId: number; // 원 게시물 ID
  boardType: string; // 게시물 카테고리
  title: string; // 게시물 제목
}
