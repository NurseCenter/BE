import { UsersEntity } from 'src/users/entities/users.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ESuspensionDuration } from '../enums';

@Entity('suspended_users')
export class suspendedUsersEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // 정지된 회원 ID
  @OneToOne(() => UsersEntity, { eager: true })
  @JoinColumn({ name: 'suspended_user_id' })
  userId: number;

  // 정지된 사유
  @Column()
  suspensionReason: string;

  // 정지 기간
  @Column({
    type: 'enum',
    enum: ESuspensionDuration,
  })
  suspensionDuration: ESuspensionDuration;

  // 정지된 날짜
  @Column({
    type: 'timestamp',
    nullable: true,
  })
  suspensionEndDate?: Date;

  // 정지당한 날짜
  @CreateDateColumn()
  createdAt: Date;

  // 정지 해제된 날짜
  // 정지 상태이면 null, 정지가 해제되었으면 날짜
  @Column({ type: 'timestamp', nullable: true, default: null })
  deletedAt: Date;
}
