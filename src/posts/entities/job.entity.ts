import { Entity } from 'typeorm';
import { BasePostsEntity } from './base-posts.entity';

@Entity('job')
export class JobEntity extends BasePostsEntity {}
