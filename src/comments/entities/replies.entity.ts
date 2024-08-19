import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { CommentsEntity } from './comments.entity';

@Entity('replies')
export class RepliesEntity {
  @PrimaryGeneratedColumn()
  repliesId: number;

  // 답글 내용
  @Column('text')
  content: string;

  // 답글이 달린 댓글 1개
  @ManyToOne(() => CommentsEntity, (comment) => comment.replies)
  comments: CommentsEntity;

  // 답글 작성일
  @CreateDateColumn()
  createdAt: Date;

  // 답글 업데이트일
  @UpdateDateColumn()
  updatedAt: Date;

  // 답글 삭제일
  @DeleteDateColumn()
  deletedAt?: Date;
}
