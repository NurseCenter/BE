export interface ISignUpResponse {
  userId: number; // 회원 ID
  email: string; // 이메일
  nickname: string; // 닉네임
  username: string; // 실명 (인증서에서 추출)
}
