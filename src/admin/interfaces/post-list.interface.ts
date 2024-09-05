export interface IPostList {
    postId: number; // 게시물 ID
    boardType: string; // 카테고리
    title: string; // 제목
    author: string; // 작성자(닉네임)
    createdAt: Date; // 작성일
}