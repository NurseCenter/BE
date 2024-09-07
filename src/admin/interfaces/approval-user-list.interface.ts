import { EMembershipStatus } from 'src/users/enums';

export interface IApprovalUserList {
  userId: number; // 회원 ID
  nickname: string; // 닉네임
  email: string; // 이메일
  createdAt: Date; // 가입 날짜
  studentStatus: EMembershipStatus; // 재학여부
  certificationDocumentUrl: string; // 첨부파일 URL
  status: string; // 상태
}
