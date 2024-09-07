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
  // 답글 고유 ID
  @PrimaryGeneratedColumn()
  replyId: number;

  // 답글 내용
  @Column({ type: 'varchar', length: 300 })
  content: string;

  // 답글 작성자 ID
  @Column()
  userId: number;

  // 댓글 ID
  @Column()
  commentId: number;

  // 답글 작성일
  @CreateDateColumn()
  createdAt: Date;

  // 답글 수정일
  // 기본 상태는 null, 수정하면 날짜
  // 수정 여부를 렌더링하기 위함.
  @UpdateDateColumn()
  updatedAt: Date;

  // 답글 삭제일
  // 기본 상태는 null, 삭제하면 날짜
  @DeleteDateColumn()
  deletedAt: Date;

  // 댓글과의 관계 설정
  @ManyToOne(() => CommentsEntity, (comment) => comment.replies)
  @JoinColumn({ name: 'commentId', referencedColumnName: 'commentId' })
  comments: CommentsEntity;

  // 회원과의 관계 설정
  @ManyToOne(() => UsersEntity, (user) => user.replies)
  @JoinColumn([{ name: 'userId', referencedColumnName: 'userId' }])
  user: UsersEntity;
}
