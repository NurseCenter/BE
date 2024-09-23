export interface IPostResponse {
  postId: number; // 게시물 ID
  userId: number; // 작성자 ID
  title: string; // 게시물 제목
  summaryContent: string; // 내용 (요약본)
  hospitalNames?: string[]; // 게시물과 관련된 병원 이름 (배열)
  createdAt: Date; // 작성일
  updatedAt?: Date; // 수정일 (업데이트 유무 렌더링, 수정된 경우에만 존재)
  presignedPostData: string[]; // presigned URL
}
