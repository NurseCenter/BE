import { UsersEntity } from 'src/users/entities/users.entity';
import {
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Column,
  JoinColumn,
  Unique,
  DeleteDateColumn,
} from 'typeorm';
import { PostsEntity } from '../../posts/entities/base-posts.entity';

@Entity('scraps')
@Unique(['postId', 'userId'])
export class ScrapsEntity {
  @PrimaryGeneratedColumn()
  scrapId: number;

  // 스크랩한 회원
  @Column()
  userId: number;

  @Column()
  postId: number;

  // 스크랩 등록한 날짜
  @CreateDateColumn()
  createdAt: Date;

  // 스크랩 취소한 날짜
  // 기본 상태 null, 정지가 해제되었으면 날짜
  @DeleteDateColumn()
  deletedAt: Date;

  // 해당 게시물
  @ManyToOne(() => PostsEntity, (post) => post.scraps)
  @JoinColumn([{ name: 'postId', referencedColumnName: 'postId' }])
  post: PostsEntity;

  @ManyToOne(() => UsersEntity, (user) => user.userId)
  @JoinColumn([{ name: 'userId', referencedColumnName: 'userId' }])
  user: UsersEntity;
}
