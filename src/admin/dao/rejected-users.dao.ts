import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RejectedUsersEntity } from '../entities';

@Injectable()
export class RejectedUsersDAO {
  constructor(
    @InjectRepository(RejectedUsersEntity)
    private readonly rejectedUsersRepository: Repository<RejectedUsersEntity>,
  ) {}

  // 정회원 승인 거절된 회원의 테이블
  // 가입 거절된 회원 생성
  async createRejectedUser(userId: number, rejectedReason: string): Promise<RejectedUsersEntity> {
    const newRejectedUser = this.rejectedUsersRepository.create({ userId, rejectedReason });
    return newRejectedUser;
  }

  // RejectedUserEntity에 저장
  async saveRejectedUser(rejectedUserEntity: RejectedUsersEntity): Promise<RejectedUsersEntity> {
    return await this.rejectedUsersRepository.save(rejectedUserEntity);
  }

  // 거절된 회원 전체 조회
  // deletedAt이 날짜인 회원은 재가입한 회원임.
  async findRejectedUsers(): Promise<RejectedUsersEntity[]> {
    return this.rejectedUsersRepository.find({ where: { deletedAt: null } });
  }

  // 특정 거절된 회원 조회
  async findRejectedUserByUserId(userId: number): Promise<RejectedUsersEntity> {
    const rejectedUser = await this.rejectedUsersRepository.findOne({
      where: { userId },
    });
    return rejectedUser;
  }
}
