import { Entity, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, Column } from 'typeorm';
import { UsersEntity } from 'src/users/entities/users.entity';
import { BasePostsEntity } from 'src/posts/entities/base-posts.entity';

@Entity('likes')
export class LikeEntity {
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

  // 좋아요 취소한 날짜
  // 기본 상태 null, 정지가 해제되었으면 날짜
  @Column({ type: 'timestamp', nullable: true, default: null })
  deletedAt: Date;
}
