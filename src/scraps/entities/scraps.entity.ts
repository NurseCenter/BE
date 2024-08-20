import { BasePostsEntity } from 'src/posts/entities/base-posts.entity';
import { UsersEntity } from 'src/users/entities/users.entity';
import {
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Column,
} from 'typeorm';

@Entity('scraps')
export class ScrapsEntity {
  @PrimaryGeneratedColumn()
  scrapId: number;

  // 스크랩한 회원
  @ManyToOne(() => UsersEntity, (user) => user.userId)
  user: UsersEntity;

  // 해당 게시물
  @ManyToOne(() => BasePostsEntity, (post) => post.postId)
  post: BasePostsEntity;

  // 스크랩 등록한 날짜
  @CreateDateColumn()
  createdAt: Date;

  // 스크랩 취소한 날짜
  // 기본 상태 null, 정지가 해제되었으면 날짜
  @Column({ type: 'timestamp', nullable: true, default: null })
  deletedAt: Date;
}
