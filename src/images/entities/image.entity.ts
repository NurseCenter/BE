import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PostsEntity } from '../../posts/entities/base-posts.entity';

@Entity('images')
export class ImageEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column()
  postId: number;

  @ManyToOne(() => PostsEntity, (post) => post.images)
  @JoinColumn({ name: 'postId', referencedColumnName: 'postId' })
  post: PostsEntity;

  @CreateDateColumn()
  createdAt: Date;
}
