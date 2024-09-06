import { PostsEntity } from 'src/posts/entities/base-posts.entity';
import { UsersEntity } from 'src/users/entities/users.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';
import { EReportReason, EReportStatus } from '../enum';

@Entity('report_posts')
export class ReportPostsEntity {
  // 신고된 댓글의 ID (신고 테이블에서의 ID)
  @PrimaryGeneratedColumn()
  reportPostId: number;

  // 신고한 회원 ID
  @Column()
  userId: number;

  // 신고당한 회원 ID
  @Column()
  reportedUserId: number;

  // 신고된 게시물의 ID
  @Column('int')
  postId: number;

  // 신고된 이유
  @Column({ type: 'enum', enum: EReportReason, nullable: true })
  reportedReason: string;

  // 기타 신고된 이유
  // 기본 null, 프론트엔드에서 입력 받음.
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    default: null,
  })
  otherReportedReason?: string;

  // 신고처리 상태
  @Column({
    type: 'enum',
    enum: EReportStatus,
    default: EReportStatus.PENDING,
  })
  status: EReportStatus;

  // 신고일자
  @CreateDateColumn()
  createdAt: Date;

  // 신고 삭제일
  // 기본 상태는 null, 삭제하면 날짜
  @DeleteDateColumn()
  deletedAt: Date;

  // 신고한 회원
  @ManyToOne(() => UsersEntity, (user) => user.submittedPostReports)
  @JoinColumn({ name: 'userId', referencedColumnName: 'userId' })
  reportingUser: UsersEntity;

  // 신고된 게시물
  @ManyToOne(() => PostsEntity, (post) => post.reportPosts)
  @JoinColumn({ name: 'postId', referencedColumnName: 'postId' })
  posts: PostsEntity;

  // 신고된 게시물의 작성자
  @ManyToOne(() => UsersEntity, (user) => user.receivedPostReports)
  @JoinColumn({ name: 'reportedUserId', referencedColumnName: 'userId' })
  reportedUser: UsersEntity;
}
