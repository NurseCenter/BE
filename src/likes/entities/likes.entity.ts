import {
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { UsersEntity } from 'src/users/entities/users.entity';
import { BasePostsEntity } from 'src/posts/entities/base-posts.entity';

@Entity('likes')
export class LikeEntity {
  // ID
  @PrimaryGeneratedColumn()
  id: number;

  // 좋아요 누른 사람
  @ManyToOne(() => UsersEntity, (user) => user.userId)
  user: UsersEntity;

  // 좋아요가 달린 게시물 1개
  @ManyToOne(() => BasePostsEntity, (post) => post.postId)
  post: BasePostsEntity;

  // 좋아요 누른 날짜
  @CreateDateColumn()
  createdAt: Date;
}
