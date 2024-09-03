import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { CommentsEntity } from '../../comments/entities/comments.entity';
import { UsersEntity } from '../../users/entities/users.entity';

@Entity('replies')
export class RepliesEntity {
  @PrimaryGeneratedColumn()
  replyId: number;

  // 답글 내용
  @Column({ type: 'varchar', length: 300 })
  content: string;

  @Column()
  userId: number;

  @Column()
  commentId: number;

  // 답글 작성일
  @CreateDateColumn()
  createdAt: Date;

  // 답글 업데이트일
  // 기본 상태는 null, 수정하면 날짜
  // 수정 여부를 렌더링하기 위함.
  @UpdateDateColumn()
  updatedAt: Date;

  // 답글 삭제일
  // 기본 상태는 null, 삭제하면 날짜
  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => CommentsEntity, (comment) => comment.replies)
  @JoinColumn({ name: 'commentId', referencedColumnName: 'commentId' })
  comments: CommentsEntity;

  @ManyToOne(() => UsersEntity, (user) => user.replies)
  @JoinColumn([{ name: 'userId', referencedColumnName: 'userId' }])
  user: UsersEntity;
}
