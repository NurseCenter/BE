import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { CommentsEntity } from '../../comments/entities/comments.entity';
import { UsersEntity } from '../../users/entities/users.entity';
import { ReportRepliesEntity } from 'src/reports/entities/report-replies.entity';

@Entity('replies')
export class RepliesEntity {
  // 답글 고유 ID
  @PrimaryGeneratedColumn()
  replyId: number;

  // 답글 내용
  @Column({ type: 'varchar', length: 300 })
  content: string;

  // 답글 작성자 ID
  @Column()
  userId: number;

  // 부모 댓글 ID
  @Column()
  commentId: number;

  // 부모 게시물 ID
  @Column()
  postId: number;

  // 답글 신고일
  // 기본 상태는 null, 신고 당하면 날짜
  @Column({ type: 'timestamp', nullable: true, default: null })
  reportedAt: Date;

  // 답글 작성일
  @CreateDateColumn()
  createdAt: Date;

  // 답글 수정일
  // 기본 상태는 null, 수정하면 날짜
  // 수정 여부를 렌더링하기 위함.
  @UpdateDateColumn({ nullable: true })
  updatedAt: Date | null;

  // 답글 삭제일
  // 기본 상태는 null, 삭제하면 날짜
  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;

  // 댓글과의 관계 설정
  @ManyToOne(() => CommentsEntity, (comment) => comment.replies)
  @JoinColumn({ name: 'commentId', referencedColumnName: 'commentId' })
  comments: CommentsEntity;

  // // 게시물과의 관계 설정
  // @ManyToOne(() => PostsEntity, (post) => post.replies)
  // @JoinColumn({ name: 'postId', referencedColumnName: 'postId' })
  // post: PostsEntity;

  // 이 답글에 대한 신고 기록들
  @OneToMany(() => ReportRepliesEntity, (report) => report.replies)
  reportReplies: ReportRepliesEntity[];

  // 회원과의 관계 설정
  @ManyToOne(() => UsersEntity, (user) => user.replies)
  @JoinColumn([{ name: 'userId', referencedColumnName: 'userId' }])
  user: UsersEntity;
}
