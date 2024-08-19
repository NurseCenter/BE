import { CommentsEntity } from 'src/comments/entities/comment.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/*
[이론정보] theory.entity.ts -> TheoryEntity
[실습정보] practice.entity.ts -> PracticeEntity
[국가고시준비] exam-prep.entity.ts -> ExamPrepEntity
[취업정보] employment.entity.ts -> EmploymentEntity
[구인구직] job.entity.ts -> JobEntity
[이벤트] event.entity.ts -> EventEntity
[공지사항] notice.entity.ts -> NoticeEntity
*/

export abstract class BasePostsEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // 제목
  @Column({ type: 'varchar', length: 255 })
  title: string;

  // 내용
  @Column({ type: 'text' })
  content: string;

  // 신고 여부
  @Column({ type: 'boolean', default: false })
  isReported: boolean;

  // 스크랩 횟수
  @Column({ type: 'int', default: 0 })

  // 조회수
  @Column({ type: 'int', default: 0 })
  viewCount: number;

  // 댓글
  // 하나의 게시글에 여러 개의 댓글이 가능함.
  @OneToMany(() => CommentsEntity, (comment) => comment.post)
  comments: CommentsEntity[];

  // 작성일
  @CreateDateColumn()
  createdAt: Date;

  // 업데이트일
  @UpdateDateColumn()
  updatedAt: Date;

  // 삭제일
  @DeleteDateColumn()
  deletedAt?: Date;
}
