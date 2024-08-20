import { CommentsEntity } from 'src/comments/entities/comments.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
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

@Entity('base_posts')
export class BasePostsEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  postId: number;

  // 제목
  @Column({ type: 'varchar', length: 50 })
  title: string;

  // 내용
  @Column({ type: 'varchar', length: 2000 })
  content: string;

  // 신고 여부
  @Column({ type: 'boolean', default: false })
  isReported: boolean;

  // 스크랩 횟수
  @Column({ type: 'int', default: 0 })
  scrapCounts: number;

  // 조회수
  @Column({ type: 'int', default: 0 })
  viewCounts: number;

  // 댓글
  // 하나의 게시글에 여러 개의 댓글이 가능함.
  @OneToMany(() => CommentsEntity, (comment) => comment.post)
  comments: CommentsEntity[];

  // 작성일
  @CreateDateColumn()
  createdAt: Date;

  // 게시물 업데이트일
  // 기본 상태는 null, 수정하면 날짜
  // 수정 여부를 렌더링하기 위함.
  @Column({ type: 'timestamp', nullable: true, default: null })
  updatedAt: Date;

  // 게시물 삭제일
  // 기본 상태는 null, 삭제하면 날짜
  @Column({ type: 'timestamp', nullable: true, default: null })
  deletedAt?: Date;
}
