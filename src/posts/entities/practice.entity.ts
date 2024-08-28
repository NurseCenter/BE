import { ChildEntity, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BasePostsEntity } from './base-posts.entity';
import { UsersEntity } from '../../users/entities/users.entity';
import { CommentsEntity } from '../../comments/entities/comments.entity';

@Entity('practice')
export class PracticeEntity extends BasePostsEntity {
  @ManyToOne(() => UsersEntity, (user) => user.practice)
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;
  @OneToMany(() => CommentsEntity, (comment) => comment.practice)
  comments: CommentsEntity[];
}
