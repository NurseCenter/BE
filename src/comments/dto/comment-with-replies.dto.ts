import { ReplyInCommentDto } from 'src/replies/dto/reply-in-comment-dto';

export class CommentWithRepliesDto {
  commentId: number; // 댓글 ID
  content: string; // 댓글 내용
  postId: number; // 게시물 ID
  boardType: string; // 게시물 카테고리
  createdAt: Date; // 댓글 작성일
  updatedAt: Date; // 댓글 수정일
  userId: number; // 작성자 ID
  nickname: string; // 작성자 닉네임
  replies: ReplyInCommentDto[]; // 해당 댓글의 답글들
}
