import { ChildEntity, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BasePostsEntity } from './base-posts.entity';
import { UsersEntity } from '../../users/entities/users.entity';
import { CommentsEntity } from '../../comments/entities/comments.entity';

@Entity('exam_prep')
export class ExamPrepEntity extends BasePostsEntity {
  @ManyToOne(() => UsersEntity, (user) => user.exam)
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;
  @OneToMany(() => CommentsEntity, (comment) => comment.exam)
  comments: CommentsEntity[];
}
