import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ESuspensionDuration } from '../enums';

@Entity('suspended_users')
export class SuspendedUsersEntity {
  // 정지당한 회원 테이블의 고유 ID
  @PrimaryGeneratedColumn()
  id: number;

  // 정지된 회원 ID
  @Column()
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

  // 정지 끝나는 날짜
  @Column({
    nullable: true, 
    default: null
  })
  suspensionEndDate: Date;

  // 정지당한 날짜
  @CreateDateColumn()
  createdAt: Date;

  // 정지 해제된 날짜
  // 정지 상태이면 null, 정지가 해제되었으면 날짜
  @DeleteDateColumn()
  deletedAt: Date;
}
