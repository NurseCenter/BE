import { UsersEntity } from 'src/users/entities/users.entity';
import {
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Column,
  JoinColumn,
  Unique,
  DeleteDateColumn
} from 'typeorm';
import { PostsEntity } from '../../posts/entities/base-posts.entity';

@Entity('scraps')
@Unique(['postId', 'userId'])
export class ScrapsEntity {
  // 스크랩 고유 ID
  @PrimaryGeneratedColumn()
  scrapId: number;

  // 스크랩한 회원의 ID
  @Column()
  userId: number;

  // 스크랩한 게시물의 ID
  @Column()
  postId: number;

  // 스크랩 등록 날짜
  @CreateDateColumn()
  createdAt: Date;

  // 스크랩 취소 날짜
  // 기본 상태는 null이며, 스크랩이 취소되면 날짜가 저장됨
  @DeleteDateColumn()
  deletedAt: Date | null;

  // 이 스크랩이 연결된 게시물
  @ManyToOne(() => PostsEntity, (post) => post.scraps)
  @JoinColumn([{ name: 'postId', referencedColumnName: 'postId' }])
  post: PostsEntity;

  // 이 스크랩을 등록한 회원
  @ManyToOne(() => UsersEntity, (user) => user.userId)
  @JoinColumn([{ name: 'userId', referencedColumnName: 'userId' }])
  user: UsersEntity;
}
