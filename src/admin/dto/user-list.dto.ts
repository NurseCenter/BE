/*
화면에 렌더링할 데이터
- 닉네임
- 이메일
- 게시물 수
- 댓글 수
- 가입일
- 정지 혹은 탈퇴 여부 ('해당없음', '정지', '탈퇴')
- 관리 사유 : 정지 혹은 탈퇴 사유
*/

export class UserListDto {
    userId: number;
    nickname: string;
    email: string;
    postCount: number;
    commentCount: number;
    createdAt: Date;
    suspensionStatus: string | null;
    deletionStatus: string | null;
    managementReason: string | null;
}
