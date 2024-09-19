import { Entity, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, Column, JoinColumn, Unique } from 'typeorm';
import { UsersEntity } from 'src/users/entities/users.entity';
import { PostsEntity } from '../../posts/entities/base-posts.entity';

@Entity('likes')
@Unique(['userId', 'postId'])
export class LikesEntity {
  // 좋아요 고유 ID
  @PrimaryGeneratedColumn()
  likeId: number;

  // 좋아요 누른 사람의 ID
  @Column()
  userId: number;

  // 좋아요를 누른 게시물의 ID
  @Column()
  postId: number;

  // 좋아요 누른 날짜
  @CreateDateColumn()
  createdAt: Date;

  // 이 좋아요를 누른 사용자
  @ManyToOne(() => UsersEntity, (user) => user.userId)
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;

  // 좋아요가 취소된 날짜
  // 기본 상태 null, 정지가 해제되었으면 날짜
  @Column({ type: 'timestamp', nullable: true, default: null })
  deletedAt: Date;

  // 이 좋아요가 달린 게시물
  @ManyToOne(() => PostsEntity, (post) => post.likes)
  @JoinColumn([{ name: 'postId', referencedColumnName: 'postId' }])
  post: PostsEntity;
}
