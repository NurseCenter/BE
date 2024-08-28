import { ChildEntity, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BasePostsEntity } from './base-posts.entity';
import { UsersEntity } from '../../users/entities/users.entity';
import { CommentsEntity } from '../../comments/entities/comments.entity';

@Entity('theory')
export class TheoryEntity extends BasePostsEntity {
  @ManyToOne(() => UsersEntity, (user) => user.theory)
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;
  @OneToMany(() => CommentsEntity, (comment) => comment.theory)
  comments: CommentsEntity[];
}
