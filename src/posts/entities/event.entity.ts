import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BasePostsEntity } from './base-posts.entity';
import { UsersEntity } from '../../users/entities/users.entity';

@Entity('event')
export class EventEntity extends BasePostsEntity {
  @ManyToOne(() => UsersEntity, (user) => user.event)
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;
}
