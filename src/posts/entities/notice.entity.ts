import { Entity } from 'typeorm';
import { BasePostsEntity } from './base-posts.entity';

@Entity('notice')
export class NoticeEntity extends BasePostsEntity {}
