import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BasePostsEntity } from './base-posts.entity';
import { UsersEntity } from '../../users/entities/users.entity';

@Entity('exam_prep')
export class ExamPrepEntity extends BasePostsEntity {
  @ManyToOne(() => UsersEntity, (user) => user.exam)
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;
}
