export interface IUser {
  userId: number; // 회원 ID
  email: string; // 이메일
  password: string; // 비밀번호
  isAdmin?: boolean; // 관리자 여부
  membershipStatus?: number; // 회원 상태
}
