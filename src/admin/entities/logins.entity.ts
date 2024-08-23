import { UsersEntity } from 'src/users/entities/users.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('logins')
export class LoginsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // 로그인한 회원
  @OneToOne(() => UsersEntity, { eager: true })
  @JoinColumn({ name: 'login_user_id' })
  user: UsersEntity;

  // 로그인한 IP 주소
  @Column()
  loginIp: string;

  // 가장 최근 로그인한 날짜
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  // 임시 비밀번호 로그인
  // 기본 상태 null, 임시 비밀번호로 로그인시 날짜
  @Column({ type: 'date', nullable: true, default: null })
  isTemporaryPassword: Date;
}
