import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('deleted_users')
export class DeletedUsersEntity {
  // 탈퇴처리된 회원 테이블에서의 고유 ID
  @PrimaryGeneratedColumn()
  id: number;

  // 회원 ID
  @Column()
  userId: number;

  // 탈퇴처리된 사유
  @Column()
  deletionReason: string;

  // 탈퇴처리된 날짜
  @CreateDateColumn()
  deletedAt: Date;
}
