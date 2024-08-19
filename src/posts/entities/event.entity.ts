import { Entity } from 'typeorm';
import { BasePostsEntity } from './base-posts.entity';

@Entity('event')
export class EventEntity extends BasePostsEntity {}
