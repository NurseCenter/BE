import { CommentsEntity } from 'src/comments/entities/comments.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UsersEntity } from '../../users/entities/users.entity';
import { LikeEntity } from '../../likes/entities/likes.entity';
import { BoardType } from '../enum/boardType.enum';
import { ScrapsEntity } from '../../scraps/entities/scraps.entity';
import { ReportPostsEntity } from '../../admin/entities/report-posts.entity';
import { ImageEntity } from '../../images/entities/image.entity';

/*
[이론정보] theory.entity.ts -> TheoryEntity
[실습정보] practice.entity.ts -> PracticeEntity
[국가고시준비] exam-prep.entity.ts -> ExamPrepEntity
[취업정보] employment.entity.ts -> EmploymentEntity
[구인구직] job.entity.ts -> JobEntity
[이벤트] event.entity.ts -> EventEntity
[공지사항] notice.entity.ts -> NoticeEntity
*/
// @Index('IDX_BOARD_TYPE_POST_ID', ['boardType', 'postId'])
@Entity('posts')
@Index('IDX_POST_ID_BOARD_TYPE', ['postId', 'boardType'])
export class PostsEntity {
  @PrimaryGeneratedColumn()
  postId: number;
  @Column({ type: 'enum', enum: BoardType, enumName: 'boardType' })
  boardType: BoardType;

  @Column()
  userId: number;

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

  @Column({ type: 'int', default: 0 })
  like: number;

  // 댓글
  // 하나의 게시글에 여러 개의 댓글이 가능함.

  // 작성일
  @CreateDateColumn()
  createdAt: Date;

  // 게시물 업데이트일
  // 기본 상태는 null, 수정하면 날짜
  // 수정 여부를 렌더링하기 위함.
  @UpdateDateColumn()
  updatedAt: Date;

  // 게시물 삭제일
  // 기본 상태는 null, 삭제하면 날짜
  @DeleteDateColumn()
  deletedAt?: Date;

  @ManyToOne(() => UsersEntity, (user) => user.posts)
  @JoinColumn({ name: 'userId', referencedColumnName: 'userId' })
  user: UsersEntity;

  @OneToMany(() => CommentsEntity, (comment) => comment.post)
  comments: CommentsEntity[];

  @OneToMany(() => LikeEntity, (like) => like.post)
  likes: LikeEntity[];

  @OneToMany(() => ScrapsEntity, (scrap) => scrap.post)
  scraps: ScrapsEntity[];

  @OneToMany(() => ReportPostsEntity, (reportPost) => reportPost.posts)
  reportPosts: ReportPostsEntity[];

  @OneToMany(() => ImageEntity, (image) => image.post)
  images: ImageEntity[];
}
