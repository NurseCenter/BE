import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BasePostsEntity } from './base-posts.entity';
import { UsersEntity } from '../../users/entities/users.entity';

@Entity('notice')
export class NoticeEntity extends BasePostsEntity {
  @ManyToOne(() => UsersEntity, (user) => user.notice)
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;
}
