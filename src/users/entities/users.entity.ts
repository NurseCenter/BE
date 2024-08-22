import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EMembershipStatus, EStudentStatus } from '../enums';
import { CommentsEntity } from '../../comments/entities/comments.entity';
import { EmploymentEntity } from '../../posts/entities/employment.entity';

@Entity('users')
export class UsersEntity {
  @PrimaryGeneratedColumn()
  // 회원 고유 ID 값
  userId: number;

  // 이름
  // 회원 실명 OCR에서 추출
  @Column({ length: 8 })
  username: string;

  // 닉네임
  @Column({ length: 8 })
  nickname: string;

  // 이메일
  @Column()
  email: string;

  // 비밀번호
  @Column({ length: 16 })
  password: string;

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

  // 인증서류 (URL string)
  @Column()
  certificationDocumentUrl: string;

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

  @OneToMany(() => EmploymentEntity, (employment) => employment.userId)
  employment: EmploymentEntity[];

  @OneToMany(() => EmploymentEntity, (event) => event.userId)
  event: EmploymentEntity[];
  @OneToMany(() => EmploymentEntity, (exam) => exam.userId)
  exam: EmploymentEntity[];

  @OneToMany(() => EmploymentEntity, (job) => job.userId)
  job: EmploymentEntity[];
  @OneToMany(() => EmploymentEntity, (notice) => notice.userId)
  notice: EmploymentEntity[];
  @OneToMany(() => EmploymentEntity, (practice) => practice.userId)
  practice: EmploymentEntity[];
  @OneToMany(() => EmploymentEntity, (theory) => theory.userId)
  theory: EmploymentEntity[];
}
