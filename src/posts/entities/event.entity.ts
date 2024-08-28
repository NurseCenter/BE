import { ChildEntity, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { UsersEntity } from '../../users/entities/users.entity';
import { BasePostsEntity } from './base-posts.entity';
import { CommentsEntity } from '../../comments/entities/comments.entity';

@Entity('event')
export class EventEntity extends BasePostsEntity {
  @ManyToOne(() => UsersEntity, (user) => user.event)
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;
  @OneToMany(() => CommentsEntity, (comment) => comment.event)
  comments: CommentsEntity[];
}
