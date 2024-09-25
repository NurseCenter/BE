import { UsersEntity } from 'src/users/entities/users.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, DeleteDateColumn, OneToOne } from 'typeorm';

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

  // 탈퇴된 회원과의 관계 설정 (1:1 관계)
  @OneToOne(() => UsersEntity, (user) => user.deletedUser)
  user: UsersEntity;
}
