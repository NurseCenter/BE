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
import { ScrapsEntity } from '../../scraps/entities/scraps.entity';
import { ImageEntity } from '../../images/entities/image.entity';
import { EBoardType } from '../enum/board-type.enum';
import { ReportPostsEntity } from 'src/reports/entities';

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
  // 게시물 고유 ID
  @PrimaryGeneratedColumn()
  postId: number;

  // 카테고리 종류
  @Column({ type: 'enum', enum: EBoardType, enumName: 'boardType' })
  boardType: EBoardType;

  // 작성자 ID
  @Column()
  userId: number;

  // 글 제목
  @Column({ type: 'varchar', length: 50 })
  title: string;

  // 글 내용
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

  // 좋아요 수
  @Column({ type: 'int', default: 0 })
  like: number;

  // 게시물 작성일
  @CreateDateColumn()
  createdAt: Date;

  // 게시물 수정일
  // 기본 상태는 null, 수정하면 날짜
  // 수정 여부를 렌더링하기 위함.
  @UpdateDateColumn()
  updatedAt: Date;

  // 게시물 삭제일
  // 기본 상태는 null, 삭제하면 날짜
  @DeleteDateColumn()
  deletedAt?: Date;

  // 글 작성자와의 관계 설정
  // 한 회원이 여러 개의 게시물을 작성할 수 있음.
  @ManyToOne(() => UsersEntity, (user) => user.posts)
  @JoinColumn({ name: 'userId', referencedColumnName: 'userId' })
  user: UsersEntity;

  // 댓글과의 관계 설정
  // 하나의 게시글에 여러 개의 댓글이 가능함
  @OneToMany(() => CommentsEntity, (comment) => comment.post)
  comments: CommentsEntity[];

  // 좋아요와의 관계 설정
  // 하나의 게시글에 여러 개의 좋아요가 있을 수 있음
  @OneToMany(() => LikeEntity, (like) => like.post)
  likes: LikeEntity[];

  // 스크랩과의 관계 설정
  // 하나의 게시글에 여러 개의 스크랩이 있을 수 있음
  @OneToMany(() => ScrapsEntity, (scrap) => scrap.post)
  scraps: ScrapsEntity[];

  // 신고된 게시글과의 관계 설정
  // 하나의 게시글에 여러 개의 신고가 있을 수 있음
  @OneToMany(() => ReportPostsEntity, (reportPost) => reportPost.posts)
  reportPosts: ReportPostsEntity[];

  // 이미지와의 관계 설정
  // 하나의 게시글에 여러 개의 이미지가 첨부될 수 있음
  @OneToMany(() => ImageEntity, (image) => image.post)
  images: ImageEntity[];
}
