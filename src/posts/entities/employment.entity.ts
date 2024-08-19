import { Entity } from 'typeorm';
import { BasePostsEntity } from './base-posts.entity';

@Entity('employment')
export class EmploymentEntity extends BasePostsEntity {}
