import { UsersEntity } from 'src/users/entities/users.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('logins')
export class LoginsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // 로그인한 회원
  @ManyToOne(() => UsersEntity, (user) => user.logins)
  @JoinColumn({ name: 'user_login_logs' })
  loginUser: UsersEntity;

  // 로그인한 IP 주소
  @Column()
  loginIp: string;

  // 가장 최근 로그인한 날짜
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
