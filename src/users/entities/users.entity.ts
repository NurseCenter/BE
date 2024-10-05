import { EMembershipStatus, EStudentStatus } from '../enums';
import { PostsEntity } from '../../posts/entities/base-posts.entity';
import { CommentsEntity } from '../../comments/entities/comments.entity';
import { RepliesEntity } from '../../replies/entities/replies.entity';
import { ScrapsEntity } from '../../scraps/entities/scraps.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LoginsEntity } from 'src/auth/entities/logins.entity';
import { ReportPostsEntity } from '../../reports/entities/report-posts.entity';
import { ReportCommentsEntity } from '../../reports/entities/report-comments.entity';
import { DeletedUsersEntity, RejectedUsersEntity, SuspendedUsersEntity } from 'src/admin/entities';

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
  tempPasswordIssuedDate: Date;

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
    default: EStudentStatus.CURRENT,
  })
  studentStatus: EStudentStatus;

  // 관리자 계정 여부
  @Column({ default: false })
  isAdmin: boolean;

  // 인증서류 (URL string)
  @Column()
  certificationDocumentUrl: string;

  // 정회원 승인 보류 여부 (가입 거절)
  @Column({ type: 'boolean', default: false })
  rejected: boolean;

  // 가입일
  @CreateDateColumn()
  createdAt?: Date;

  // 활동 정지 종료 날짜
  // 기본 상태 null, 정지된 경우 정지가 종료되는 날짜를 저장
  @Column({ nullable: true, default: null })
  suspensionEndDate?: Date;

  // 탈퇴일
  // 탈퇴하지 않은 경우 null이며, 탈퇴 시 날짜가 저장됨
  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date | null;

  // 이 회원이 작성한 게시물들
  @OneToMany(() => PostsEntity, (post) => post.user)
  posts: PostsEntity[];

  // 이 회원이 작성한 댓글들
  @OneToMany(() => CommentsEntity, (comment) => comment.user)
  comments: CommentsEntity[];

  // 이 회원이 작성한 답글들
  @OneToMany(() => RepliesEntity, (reply) => reply.user)
  replies: RepliesEntity[];

  // 이 회원이 스크랩한 게시물들
  @OneToMany(() => ScrapsEntity, (scrap) => scrap.user)
  scraps: ScrapsEntity[];

  // 이 사용자의 로그인 기록들
  @OneToMany(() => LoginsEntity, (login) => login.loginUser)
  logins: LoginsEntity[];

  // 이 사용자가 신고한 게시물들
  @OneToMany(() => ReportPostsEntity, (reportPost) => reportPost.reportingUser)
  submittedPostReports: ReportPostsEntity[];

  // 이 사용자가 신고받은 게시물들
  @OneToMany(() => ReportPostsEntity, (reportPost) => reportPost.reportedUser)
  receivedPostReports: ReportPostsEntity[];

  // 이 사용자가 신고한 댓글들
  @OneToMany(() => ReportCommentsEntity, (reportPost) => reportPost.reportingUser)
  submittedCommentReports: ReportCommentsEntity[];

  // 이 사용자가 신고받은 댓글들
  @OneToMany(() => ReportCommentsEntity, (reportPost) => reportPost.reportedUser)
  receivedCommentReports: ReportCommentsEntity[];

  // 이 회원이 정회원 승인 보류 (가입거절)된 경우의 기록 (1:1 관계)
  @OneToOne(() => RejectedUsersEntity, (rejectedUser) => rejectedUser.user, { nullable: true })
  rejectedUser: RejectedUsersEntity;

  // 이 회원의 탈퇴 정보 (1:1 관계)
  @OneToOne(() => DeletedUsersEntity, (deletedUser) => deletedUser.user, { nullable: true })
  deletedUser: DeletedUsersEntity;

  // 이 회원의 정지 정보 (1:1 관계)
  @OneToOne(() => SuspendedUsersEntity, (suspendedUser) => suspendedUser.user, { nullable: true })
  suspendedUser: SuspendedUsersEntity;
}
