export enum EMembershipStatus {
  NON_MEMBER = 0, // 비회원
  PENDING_VERIFICATION = 1, // 이메일 인증 대기
  EMAIL_VERIFIED = 2, // 이메일 인증 완료 (관리자 승인 대기)
  APPROVED_MEMBER = 3, // 정회원
  REJECTED_MEMBER = 4, // 회원가입 거절
}
