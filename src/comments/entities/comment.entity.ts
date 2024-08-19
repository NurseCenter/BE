import { Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseCommentsEntity } from './base-comments-entity';

@Entity('comments')
export class CommentsEntity extends BaseCommentsEntity {
  // 여러 개의 댓글이 하나의 부모 댓글을 가질 수 있음.
  @ManyToOne(() => CommentsEntity, (comment) => comment.children, {
    nullable: true,
  })
  parent: CommentsEntity;

  // 하나의 댓글이 여러 개의 자식 댓글을 가질 수 있음.
  @OneToMany(() => CommentsEntity, (comment) => comment.parent)
  children: CommentsEntity[];
}
