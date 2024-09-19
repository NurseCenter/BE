import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PostsEntity } from '../../posts/entities/base-posts.entity';

@Entity('images')
export class ImagesEntity {
  // 이미지 고유 ID
  @PrimaryGeneratedColumn()
  id: number;

  // 이미지 파일의 URL
  @Column()
  url: string;

  // 이미지가 첨부된 게시물 ID
  @Column()
  postId: number;

  // 이 이미지가 첨부된 게시물
  @ManyToOne(() => PostsEntity, (post) => post.images)
  @JoinColumn({ name: 'postId', referencedColumnName: 'postId' })
  post: PostsEntity;

  // 이미지가 업로드된 날짜
  @CreateDateColumn()
  createdAt: Date;
}
