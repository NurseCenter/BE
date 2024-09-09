import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuspendedUsersEntity } from '../entities';

@Injectable()
export class SuspendedUsersDAO {
  constructor(
    @InjectRepository(SuspendedUsersEntity)
    private readonly suspendedUsersRepository: Repository<SuspendedUsersEntity>,
  ) {}

  // 회원 정지 시 SuspendedUsersEntity에 새로운 엔티티 객체를 생성
  async createSuspendedUser(userId: number): Promise<SuspendedUsersEntity> {
    const newSuspendedUser = this.suspendedUsersRepository.create({ userId });
    return newSuspendedUser;
  }

  // SuspendedUsersEntity에 저장
  async saveSuspendedUser(suspendedUserEntity: SuspendedUsersEntity): Promise<SuspendedUsersEntity> {
    return await this.suspendedUsersRepository.save(suspendedUserEntity);
  }

  // 정지된 회원 전체 조회
  async findSuspendedUsers() {
    return this.suspendedUsersRepository.find();
  }

  // 특정 정지된 회원 조회
  async findSuspendedUserByUserId(userId: number): Promise<SuspendedUsersEntity> {
    return await this.suspendedUsersRepository.findOne({
      where: { userId },
    });
  }
}
