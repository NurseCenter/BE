export class ReplyInCommentDto {
  replyId: number; // 답글 ID
  content: string; // 답글 내용
  createdAt: Date; // 작성일
  updatedAt: Date | null; // 수정일
  nickname: string; // 작성자 닉네임
}
