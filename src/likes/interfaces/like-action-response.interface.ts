export interface ILikeActionResponse {
    success: boolean;
    action: 'liked' | 'unliked'; // 좋아요 혹은 좋아요취소
}