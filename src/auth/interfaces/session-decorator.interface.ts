export interface User {
  userId: number;
  username: string | null;
  nickname: string;
  phoneNumber: string;
  email: string;
  isTempPassword: boolean | null;
  membershipStatus: number;
  studentStatus: 'current_student' | string; // 다른 가능한 값들이 있다면 여기에 추가
  isAdmin: boolean;
  certificationDocumentUrl: string;
  rejected: boolean;
  createdAt: string; // 또는 Date 타입을 사용할 수 있습니다
  suspensionEndDate: string | null; // 또는 Date | null
  deletedAt: string | null; // 또는 Date | null
}
