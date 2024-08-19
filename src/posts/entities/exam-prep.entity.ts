import { Entity } from 'typeorm';
import { BasePostsEntity } from './base-posts.entity';

@Entity('exam_prep')
export class ExamPrepEntity extends BasePostsEntity {}
