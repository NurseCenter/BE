import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BasePostsEntity } from './base-posts.entity';
import { UsersEntity } from '../../users/entities/users.entity';

@Entity('practice')
export class PracticeEntity extends BasePostsEntity {
  @ManyToOne(() => UsersEntity, (user) => user.practice)
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;
}
