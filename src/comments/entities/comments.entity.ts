import { BasePostsEntity } from 'src/posts/entities/base-posts.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { RepliesEntity } from './replies.entity';

@Entity('comments')
export class CommentsEntity {
  @PrimaryGeneratedColumn()
  commentId: number;

  // 댓글 내용
  @Column({ type: 'text', length: 300 })
  content: string;

  // 댓글 신고일
  // 기본 상태는 null, 신고 당하면 날짜
  @Column({ type: 'timestamp', nullable: true, default: null })
  reportedAt: Date;

  // 댓글이 달린 글 1개
  @ManyToOne(() => BasePostsEntity, (post) => post.comments)
  post: BasePostsEntity;

  // 댓글에 대한 답글
  @OneToMany(() => RepliesEntity, (reply) => reply.comments)
  replies: RepliesEntity[];

  // 댓글 작성일
  @CreateDateColumn()
  createdAt: Date;

  // 댓글 업데이트일
  // 기본 상태는 null, 수정하면 날짜
  // 수정 여부를 렌더링하기 위함.
  @Column({ type: 'timestamp', nullable: true, default: null })
  updatedAt: Date;

  // 댓글 삭제일
  // 기본 상태는 null, 삭제하면 날짜
  @Column({ type: 'timestamp', nullable: true, default: null })
  deletedAt: Date;
}
