import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BasePostsEntity } from './base-posts.entity';
import { UsersEntity } from '../../users/entities/users.entity';

@Entity('theory')
export class TheoryEntity extends BasePostsEntity {
  @ManyToOne(() => UsersEntity, (user) => user.theory)
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;
}
