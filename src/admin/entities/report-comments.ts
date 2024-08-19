import { UsersEntity } from 'src/users/entities/users.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Column,
} from 'typeorm';

@Entity('report_comments')
export class ReportCommentsEntity {
  @PrimaryGeneratedColumn()
  reportCommentId: number;

  // 신고자
  @ManyToOne(() => UsersEntity, (user) => user.userId)
  reporter: UsersEntity;

  // 신고된 댓글의 ID
  @Column('int')
  reportedCommentId: number;

  // 신고된 댓글의 내용
  @Column('text')
  reportedContent: string;

  // 신고된 댓글 작성자
  @ManyToOne(() => UsersEntity, (user) => user.userId)
  reportedPerson: UsersEntity;

  // 신고일
  @CreateDateColumn()
  dateReported: Date;
}
