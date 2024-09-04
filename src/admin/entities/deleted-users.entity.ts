import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('deleted_users')
export class DeletedUsersEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // 회원 ID
  @Column()
  userId: number;

  // 탈퇴처리된 사유
  @Column()
  reason: string;

  // 탈퇴처리된 날짜
  @CreateDateColumn()
  deletedAt: Date;
}