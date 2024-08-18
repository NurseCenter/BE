import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum MembershipStatus {
  NON_MEMBER = 0, // 비회원
  PENDING_VERIFICATION = 1, // 이메일 인증 대기
  EMAIL_VERIFIED = 2, // 이메일 인증 완료 (관리자 승인 대기)
  APPROVED_MEMBER = 3, // 정회원
  REJECTED_MEMBER = 4, // 회원가입 거절
}

export enum StudentStatus {
  CURRENT_STUDENT = 'current_student', // 재학생
  ALUMNI = 'alumni', // 졸업생
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  // 회원 고유 ID 값
  id: number;

  // 이름
  @Column()
  username: string;

  // 닉네임
  @Column()
  nickname: string;

  // 이메일
  @Column()
  email: string;

  // 비밀번호
  @Column()
  password: string;

  // 회원 가입 인증 상태
  @Column({
    type: 'enum',
    enum: MembershipStatus,
    default: MembershipStatus.NON_MEMBER,
  })
  membershipStatus: MembershipStatus;

  // 재학생 졸업생 여부
  @Column({
    type: 'enum',
    enum: StudentStatus,
    default: StudentStatus.CURRENT_STUDENT,
  })
  studentStatus: StudentStatus;

  // 인증서류 (URL string)
  @Column({ nullable: true })
  certificationDocumentUrl: string;
}
