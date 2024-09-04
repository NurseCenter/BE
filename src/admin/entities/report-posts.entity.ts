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
import { EReportReason } from '../enums';
import { PostsEntity } from '../../posts/entities/base-posts.entity';
import { EReportStatus } from '../enums/report-status.enum';

@Entity('report_posts')
export class ReportPostsEntity {
  @PrimaryGeneratedColumn()
  reportPostId: number;
  //신고한 사용자
  @Column()
  userId: number;

  //신고당한 사용자
  @Column()
  reportedUserId: number;

  // 신고된 글의 ID
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

  @Column({
    type: 'enum',
    enum: EReportStatus,
    default: EReportStatus.PENDING,
  })
  status: EReportStatus;

  // 신고일
  @CreateDateColumn()
  createdAt: Date;

  // 신고 삭제일
  // 기본 상태는 null, 삭제하면 날짜
  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => UsersEntity, (user) => user.submittedPostReports)
  @JoinColumn({ name: 'userId', referencedColumnName: 'userId' })
  reportingUser: UsersEntity;

  @ManyToOne(() => PostsEntity, (post) => post.reportPosts)
  @JoinColumn({ name: 'postId', referencedColumnName: 'postId' })
  posts: PostsEntity;

  // 신고된 글의 작성자
  @ManyToOne(() => UsersEntity, (user) => user.receivedPostReports)
  @JoinColumn({ name: 'reportedUserId', referencedColumnName: 'userId' })
  reportedUser: UsersEntity;
}
