export enum EMembershipStatus {
  NON_MEMBER = 0, // 기본값
  PENDING_VERIFICATION = 1, // 이메일 발송 후 인증 대기
  EMAIL_VERIFIED = 2, // 이메일 인증 완료 (관리자 승인 대기)
  APPROVED_MEMBER = 3, // 정회원
}
