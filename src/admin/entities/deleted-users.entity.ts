import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('deleted_users')
export class DeletedUsersEntity {
  // 탈퇴처리된 회원 테이블에서의 고유 ID
  @PrimaryGeneratedColumn()
  id: number;

  // 회원 ID
  @Column()
  userId: number;

  // 탈퇴처리된 사유
  @Column({ default: null })
  deletionReason: string;

  // 탈퇴처리된 날짜
  @CreateDateColumn()
  createdAt: Date;

  // 탈퇴처리 해제된 날짜
  // 원래 상태로 돌아감
  @DeleteDateColumn()
  deletedAt: Date;
}
