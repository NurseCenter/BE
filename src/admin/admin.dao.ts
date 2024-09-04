import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeletedUsersEntity, SuspendedUsersEntity } from './entities';

@Injectable()
export class AdminDAO {
  constructor(
    @InjectRepository(DeletedUsersEntity)
    private readonly deletedUserRepository: Repository<DeletedUsersEntity>,
    @InjectRepository(SuspendedUsersEntity)
    private readonly suspendedUserRepository: Repository<SuspendedUsersEntity>, 
  ) {}

  // 회원 탈퇴 시 DeletedUsersEntity에 새로운 객체를 생성
  async createDeletedUser(userId: number): Promise<DeletedUsersEntity> {
    const newDeletedUser = this.deletedUserRepository.create({ userId });
    return newDeletedUser;
  }

  // DeletedUsersEntity에 저장
  async saveDeletedUser(deletedUserEntity: DeletedUsersEntity): Promise<DeletedUsersEntity> {
    return await this.deletedUserRepository.save(deletedUserEntity);
  }

   // 회원 정지 시 SuspendedUsersEntity에 새로운 엔티티 객체를 생성
  async createSuspendedUser(userId: number): Promise<SuspendedUsersEntity> {
    const newSuspendedUser = this.suspendedUserRepository.create({ userId });
    return newSuspendedUser;
  }

  // SuspendedUsersEntity에 저장
  async saveSuspendedUser(suspendedUserEntity: SuspendedUsersEntity): Promise<SuspendedUsersEntity> {
    return await this.suspendedUserRepository.save(suspendedUserEntity);
  }
}