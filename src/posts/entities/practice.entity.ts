import { Entity } from 'typeorm';
import { BasePostsEntity } from './base-posts.entity';

@Entity('practice')
export class PracticeEntity extends BasePostsEntity {}
