import { UsersEntity } from 'src/users/entities/users.entity';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('rejected_users')
export class RejectedUsersEntity {
  // 테이블 고유 ID
  @PrimaryGeneratedColumn()
  rejectedId: number;

  // 거절된 회원의 ID
  @Column()
  userId: number;

  // 정회원 승인 보류당한 사유
  @Column({ default: null })
  rejectedReason: string | null;

  // 가입 거절된 날짜
  @CreateDateColumn()
  createdAt: Date;

  // 재가입 후 승인 시 날짜
  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;

  // 거절된 회원과의 관계 설정 (1:1 관계)
  @OneToOne(() => UsersEntity, (user) => user.rejectedUser)
  user: UsersEntity;
}
