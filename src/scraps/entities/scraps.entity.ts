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
  id: number;

  // 스크랩한 회원
  // 여러 개의 스크랩이 한 명의 회원에서 이루어질 수 있음.
  @ManyToOne(() => UsersEntity, (user) => user.id)
  user: UsersEntity;

  // 해당 게시물
  // 여러 개의 스크랩이 한 게시물에서 가능함.
  @ManyToOne(() => BasePostsEntity, (post) => post.id)
  post: BasePostsEntity;

  @CreateDateColumn()
  createdAt: Date;
}
