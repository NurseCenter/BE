import { BasePostsEntity } from 'src/posts/entities/base-posts.entity';
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
import { RepliesEntity } from './replies.entity';
import { BoardType } from '../../posts/enum/boardType.enum';
import { EmploymentEntity } from '../../posts/entities/employment.entity';
import { EventEntity } from '../../posts/entities/event.entity';
import { ExamPrepEntity } from '../../posts/entities/exam-prep.entity';
import { JobEntity } from '../../posts/entities/job.entity';
import { NoticeEntity } from '../../posts/entities/notice.entity';
import { PracticeEntity } from '../../posts/entities/practice.entity';
import { TheoryEntity } from '../../posts/entities/theory.entity';

@Entity('comments')
export class CommentsEntity {
  @PrimaryGeneratedColumn()
  commentId: number;

  // 댓글 내용
  @Column({ type: 'varchar', length: 300 })
  content: string;

  @Column({ type: 'int' })
  userId: number;

  @Column({ type: 'int' })
  postId: number;
  @Column({ type: 'enum', enum: BoardType, enumName: 'boardType' })
  boardType: BoardType;

  // 댓글 신고일
  // 기본 상태는 null, 신고 당하면 날짜
  @Column({ type: 'timestamp', nullable: true, default: null })
  reportedAt: Date;

  // 댓글에 대한 답글
  @OneToMany(() => RepliesEntity, (reply) => reply.comments)
  replies: RepliesEntity[];

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

  @OneToMany('EmploymentEntity', 'comment')
  employment: EmploymentEntity[];

  @OneToMany('EventEntity', 'comment')
  event: EventEntity[];

  @OneToMany('ExamPrepEntity', 'comment')
  exam: ExamPrepEntity[];

  @OneToMany('JobEntity', 'comment')
  job: JobEntity[];

  @OneToMany('NoticeEntity', 'comment')
  notice: NoticeEntity[];

  @OneToMany('PracticeEntity', 'comment')
  practice: PracticeEntity[];

  @OneToMany('TheoryEntity', 'comment')
  theory: TheoryEntity[];
}
