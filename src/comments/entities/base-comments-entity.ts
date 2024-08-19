import { BasePostsEntity } from 'src/posts/entities/base-posts.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class BaseCommentsEntity {
  // 댓글 ID
  @PrimaryGeneratedColumn()
  id: number;

  // 댓글 작성자
  // 한 명의 회원이 여러 개의 댓글을 달 수 있음.
  @ManyToOne(() => User, (user) => user.id)
  author: User;

  // 댓글이 속한 게시물
  // 여러 개의 댓글이 하나의 게시물에 달릴 수 있음.
  @ManyToOne(() => BasePostsEntity, (post) => post.comments)
  post: BasePostsEntity;

  // 댓글 내용
  @Column('text')
  content: string;

  // 작성일
  @CreateDateColumn()
  createdAt: Date;

  // 수정일
  @UpdateDateColumn()
  updatedAt: Date;

  // 삭제일
  @DeleteDateColumn()
  deletedAt?: Date;
}
