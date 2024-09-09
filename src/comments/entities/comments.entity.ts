import { PostsEntity } from 'src/posts/entities/base-posts.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  JoinColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RepliesEntity } from '../../replies/entities/replies.entity';
import { BoardType } from '../../posts/enum/boardType.enum';
import { UsersEntity } from '../../users/entities/users.entity';
import { ReportCommentsEntity } from '../../admin/entities/report-comments.entity';

@Entity('comments')
export class CommentsEntity {
  @PrimaryGeneratedColumn()
  commentId: number;

  // 댓글 내용
  @Column({ type: 'varchar', length: 300 })
  content: string;

  @Column({ type: 'int' })
  userId: number;

  @Column()
  postId: number;

  @Column({ type: 'enum', enum: BoardType })
  boardType: BoardType;

  // 댓글 신고일
  // 기본 상태는 null, 신고 당하면 날짜
  @Column({ type: 'timestamp', nullable: true, default: null })
  reportedAt: Date;

  // 댓글 작성일
  @CreateDateColumn()
  createdAt: Date;

  // 댓글 업데이트일
  // 기본 상태는 null, 수정하면 날짜
  // 수정 여부를 렌더링하기 위함.
  @UpdateDateColumn()
  updatedAt: Date;

  // 댓글 삭제일
  // 기본 상태는 null, 삭제하면 날짜
  @DeleteDateColumn()
  deletedAt: Date;

  // 댓글에 대한 답글
  @OneToMany(() => RepliesEntity, (reply) => reply.comments)
  replies: RepliesEntity[];

  @ManyToOne(() => PostsEntity, (post) => post.comments)
  @JoinColumn([
    { name: 'postId', referencedColumnName: 'postId' },
    { name: 'boardType', referencedColumnName: 'boardType' },
  ])
  post: PostsEntity;

  @ManyToOne(() => UsersEntity, (user) => user.comments)
  @JoinColumn([{ name: 'userId', referencedColumnName: 'userId' }])
  user: UsersEntity;

  @OneToMany(() => ReportCommentsEntity, (reportComment) => reportComment.comments)
  reportComments: ReportCommentsEntity[];
}
