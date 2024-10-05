/*
관리자 페이지 회원 관리 화면에 렌더링할 데이터
- 닉네임
- 이메일
- 게시물 수
- 댓글 수
- 가입일
- 정지 혹은 탈퇴 여부 ('해당없음', '정지', '탈퇴')
- 관리 사유 : 정지 혹은 탈퇴 사유
*/

export interface IUserList {
  userId: number; // 회원 ID
  nickname: string; // 닉네임
  email: string; // 이메일
  postCount: number; // 게시글 수
  commentCount: number; // 댓글 수
  createdAt: Date; // 가입일
  managementStatus: string; // 정지 또는 탈퇴 여부 (정지, 탈퇴, 해당없음)
  managementReason: string | null; // 관리 사유
}
