import { BasePostsEntity } from 'src/posts/entities/base-posts.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { RepliesEntity } from './replies.entity';

@Entity('comments')
export class CommentsEntity {
  @PrimaryGeneratedColumn()
  commentId: number;

  // 댓글 내용
  @Column('text')
  content: string;

  // 댓글 신고 여부
  @Column({ type: 'boolean', default: false })
  isReported: boolean;

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
  @UpdateDateColumn()
  updatedAt: Date;

  // 댓글 삭제일
  @DeleteDateColumn()
  deletedAt?: Date;
}
