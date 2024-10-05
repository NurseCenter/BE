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
} from 'typeorm';
import { RepliesEntity } from '../../replies/entities/replies.entity';
import { EBoardType } from '../../posts/enum/board-type.enum';
import { UsersEntity } from '../../users/entities/users.entity';
import { ReportCommentsEntity } from '../../reports/entities/report-comments.entity';

@Entity('comments')
export class CommentsEntity {
  // 댓글 고유 ID 값
  @PrimaryGeneratedColumn()
  commentId: number;

  // 댓글 내용
  @Column({ type: 'varchar', length: 300 })
  content: string;

  // 댓글 작성자 ID
  @Column({ type: 'int' })
  userId: number;

  // 댓글이 작성된 게시물 ID
  @Column()
  postId: number;

  // 게시물의 카테고리
  @Column({ type: 'enum', enum: EBoardType })
  boardType: EBoardType;

  // 댓글 신고일
  // 기본 상태는 null, 신고 당하면 날짜
  @Column({ type: 'timestamp', nullable: true, default: null })
  reportedAt: Date;

  // 댓글 작성일
  @CreateDateColumn()
  createdAt: Date;

  // 댓글 수정일
  // 기본 상태는 null, 수정하면 날짜
  // 수정 여부를 렌더링하기 위함.
  @Column({ type: 'timestamp', nullable: true })
  updatedAt: Date;

  // 댓글 삭제일
  // 기본 상태는 null, 삭제하면 날짜
  @DeleteDateColumn()
  deletedAt: Date;

  // 이 댓글에 달린 답글들
  @OneToMany(() => RepliesEntity, (reply) => reply.comments)
  replies: RepliesEntity[];

  // 이 댓글이 작성된 게시물
  @ManyToOne(() => PostsEntity, (post) => post.comments)
  @JoinColumn([
    { name: 'postId', referencedColumnName: 'postId' },
    { name: 'boardType', referencedColumnName: 'boardType' },
  ])
  post: PostsEntity;

  // 이 댓글을 작성한 회원
  @ManyToOne(() => UsersEntity, (user) => user.comments)
  @JoinColumn([{ name: 'userId', referencedColumnName: 'userId' }])
  user: UsersEntity;

  // 이 댓글에 대한 신고 기록들
  @OneToMany(() => ReportCommentsEntity, (reportComment) => reportComment.comments)
  reportComments: ReportCommentsEntity[];
}
