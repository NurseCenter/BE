import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BasePostsEntity } from './base-posts.entity';
import { UsersEntity } from '../../users/entities/users.entity';

@Entity('employment')
export class EmploymentEntity extends BasePostsEntity {
  @ManyToOne(() => UsersEntity, (user) => user.employment)
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;
}
