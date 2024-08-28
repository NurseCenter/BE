import { ChildEntity, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BasePostsEntity } from './base-posts.entity';
import { UsersEntity } from '../../users/entities/users.entity';
import { CommentsEntity } from '../../comments/entities/comments.entity';

@Entity('notice')
export class NoticeEntity extends BasePostsEntity {
  @ManyToOne(() => UsersEntity, (user) => user.notice)
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;
  @OneToMany(() => CommentsEntity, (comment) => comment.notice)
  comments: CommentsEntity[];
}
