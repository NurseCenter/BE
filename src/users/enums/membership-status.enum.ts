export enum EMembershipStatus {
  NON_MEMBER = 'non_member', // 기본값
  PENDING_VERIFICATION = 'pending_verification', // 이메일 발송 후 인증 대기
  EMAIL_VERIFIED = 'email_verified', // 이메일 인증 완료 (관리자 승인 대기)
  APPROVED_MEMBER = 'approved_member', // 정회원
}
