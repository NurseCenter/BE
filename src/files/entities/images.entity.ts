import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PostsEntity } from '../../posts/entities/base-posts.entity';

@Entity('images')
export class ImagesEntity {
  // 본문에 첨부한 이미지 고유 ID
  @PrimaryGeneratedColumn()
  imageId: number;

  // 이미지의 URL
  @Column()
  url: string;

  // 이 파일이 첨부된 게시물 ID
  @Column()
  postId: number;

  // 이 파일이 첨부된 게시물과의 관계
  @ManyToOne(() => PostsEntity, (post) => post.images)
  post: PostsEntity;

  // 파일의 타입
  @Column()
  fileType: string;

  // 파일이 업로드된 날짜
  @CreateDateColumn()
  createdAt: Date;

  // 파일이 삭제된 날짜
  @Column({ nullable: true })
  deletedAt: Date | null;
}
