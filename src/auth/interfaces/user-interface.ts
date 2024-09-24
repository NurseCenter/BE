import { EMembershipStatus, EStudentStatus } from 'src/users/enums';

export interface IUser {
  userId: number; // 회원 ID
  username: string | null; // 실명
  nickname: string; // 닉네임
  phoneNumber: string; // 휴대폰번호
  password: string; // 비밀번호
  email: string; // 이메일
  tempPasswordIssuedDate: Date | null; // 임시 비밀번호 발급 날짜
  membershipStatus: EMembershipStatus; // 회원 상태
  studentStatus: EStudentStatus; // 졸업생 혹은 재학생
  isAdmin: boolean; // 관리자 여부
  certificationDocumentUrl: string; // 인증서 URL
  rejected: boolean; // 가입 보류 여부
  createdAt: string; // 가입일
  suspensionEndDate: string | null; // 정지일
  deletedAt: string | null; // 탈퇴일
}
