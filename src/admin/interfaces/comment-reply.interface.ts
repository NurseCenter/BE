import { EBoardType } from "src/posts/enum/board-type.enum";

export interface ICommentOrReply {
    id: number; // 댓글 혹은 답글 ID
    category: EBoardType; // 게시판 카테고리
    postTitle: string; // 게시물 제목
    content: string; // 댓글 혹은 답글 내용
    nickname: string; // 작성자(닉네임)
    createdAt: Date; // 작성일
  }