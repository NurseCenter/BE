import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EMembershipStatus, EStudentStatus } from '../enums';
import { LoginsEntity } from 'src/auth/entities/logins.entity';

@Entity('users')
export class UsersEntity {
  @PrimaryGeneratedColumn()
  // 회원 고유 ID 값
  userId: number;

  // 이름
  // 회원 실명 OCR에서 추출
  @Column({ length: 8, default: null })
  username: string;

  // 닉네임
  @Column({ length: 8 })
  nickname: string;

  // 휴대폰 번호
  @Column()
  phoneNumber: string;

  // 이메일
  @Column()
  email: string;

  // 비밀번호
  @Column()
  password: string;

  // 임시비밀번호 발급 여부
  // 기본 null, 발급시 해당 날짜
  @Column({ type: 'date', nullable: true, default: null })
  isTempPassword: boolean;

  // 회원 가입 인증 상태
  @Column({
    type: 'enum',
    enum: EMembershipStatus,
    default: EMembershipStatus.NON_MEMBER,
  })
  membershipStatus: EMembershipStatus;

  // 재학생 졸업생 여부
  @Column({
    type: 'enum',
    enum: EStudentStatus,
    default: EStudentStatus.CURRENT_STUDENT,
  })
  studentStatus: EStudentStatus;

  // 관리자 계정 여부
  @Column({ default: false })
  isAdmin: boolean;

  // 인증서류 (URL string)
  @Column()
  certificationDocumentUrl: string;

  // 가입 보류 여부
  @Column({ type: 'boolean', default: false })
  rejected: boolean;

  // 가입일
  @CreateDateColumn()
  createdAt?: Date;

  // 활동 정지 종료 날짜
  // 기본 상태 null, 정지되었으면 정지가 종료되는 날짜
  @Column({ type: 'timestamp', nullable: true, default: null })
  suspensionEndDate?: Date;

  // 탈퇴일
  // 탈퇴하지 않은 null, 탈퇴하면 날짜
  @Column({ type: 'timestamp', nullable: true, default: null })
  deletedAt?: Date;

  // 여러 로그인 기록
  @OneToMany(() => LoginsEntity, (login) => login.loginUser)
  logins: LoginsEntity[];
}
