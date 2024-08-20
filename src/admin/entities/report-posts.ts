import { UsersEntity } from 'src/users/entities/users.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { SuspensionReason } from '../enums';

@Entity('report_posts')
export class ReportPostsEntity {
  @PrimaryGeneratedColumn()
  reportPostId: number;

  // 신고자
  @ManyToOne(() => UsersEntity, (user) => user.userId)
  reporter: UsersEntity;

  // 신고된 글의 ID
  @Column('int')
  reportedPostId: number;

  // 신고된 글의 내용
  @Column('text')
  reportedContent: string;

  // 신고된 글의 작성자
  @ManyToOne(() => UsersEntity, (user) => user.userId)
  reportedPerson: UsersEntity;

  // 신고된 이유
  @Column({ type: 'enum', enum: SuspensionReason, nullable: true })
  reportedReason: string;

  // 기타 신고된 이유
  // 기본 null, 프론트엔드에서 입력 받음.
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    default: null,
  })
  otherReportedReason?: string;

  // 신고일
  @CreateDateColumn()
  dateReported: Date;

  // 신고 삭제일
  // 기본 상태는 null, 삭제하면 날짜
  @Column({ type: 'timestamp', nullable: true, default: null })
  deletedAt: Date;
}
