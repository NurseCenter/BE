import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PostsEntity } from '../../posts/entities/base-posts.entity';

@Entity('files')
export class FilesEntity {
  // 파일의 고유 ID
  @PrimaryGeneratedColumn()
  id: number;

  // 파일의 URL
  @Column()
  url: string;

  // 이 파일이 첨부된 게시물 ID
  @Column()
  postId: number;

  // 이 파일이 첨부된 게시물
  @ManyToOne(() => PostsEntity, (post) => post.files)
  @JoinColumn({ name: 'postId', referencedColumnName: 'postId' })
  post: PostsEntity;

  // 파일이 업로드된 날짜
  @CreateDateColumn()
  createdAt: Date;
}
