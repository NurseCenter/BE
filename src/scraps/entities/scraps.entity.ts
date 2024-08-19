import { BasePostsEntity } from 'src/posts/entities/base-posts.entity';
import { UsersEntity } from 'src/users/entities/users.entity';
import {
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('scraps')
export class ScrapsEntity {
  // 스크랩 ID 값
  @PrimaryGeneratedColumn()
  scrapId: number;

  // 스크랩한 회원
  @ManyToOne(() => UsersEntity, (user) => user.userId)
  user: UsersEntity;

  // 해당 게시물
  @ManyToOne(() => BasePostsEntity, (post) => post.postId)
  post: BasePostsEntity;

  // 스크랩한 날짜
  @CreateDateColumn()
  createdAt: Date;
}
