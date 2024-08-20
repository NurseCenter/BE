import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { CommentsEntity } from './comments.entity';

@Entity('replies')
export class RepliesEntity {
  @PrimaryGeneratedColumn()
  repliesId: number;

  // 답글 내용
  @Column({ type: 'text', length: 300 })
  content: string;

  // 답글이 달린 댓글 1개
  @ManyToOne(() => CommentsEntity, (comment) => comment.replies)
  comments: CommentsEntity;

  // 답글 작성일
  @CreateDateColumn()
  createdAt: Date;

  // 답글 업데이트일
  // 기본 상태는 null, 수정하면 날짜
  // 수정 여부를 렌더링하기 위함.
  @Column({ type: 'timestamp', nullable: true, default: null })
  updatedAt: Date;

  // 답글 삭제일
  // 기본 상태는 null, 삭제하면 날짜
  @Column({ type: 'timestamp', nullable: true, default: null })
  deletedAt: Date;
}
