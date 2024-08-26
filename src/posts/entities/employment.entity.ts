import { Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BasePostsEntity } from './base-posts.entity';
import { UsersEntity } from '../../users/entities/users.entity';
import { LikeEntity } from '../../likes/entities/likes.entity';

@Entity('employment')
export class EmploymentEntity extends BasePostsEntity {
  @ManyToOne(() => UsersEntity, (user) => user.employment)
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;


}
