import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeletedUsersEntity } from '../entities';

@Injectable()
export class DeletedUsersDAO {
  constructor(
    @InjectRepository(DeletedUsersEntity)
    private readonly deletedUsersRepository: Repository<DeletedUsersEntity>,
  ) {}

  // 회원 탈퇴 시 DeletedUsersEntity에 새로운 객체를 생성
  async createDeletedUser(userId: number): Promise<DeletedUsersEntity> {
    const newDeletedUser = this.deletedUsersRepository.create({ userId });
    return newDeletedUser;
  }

  // DeletedUsersEntity에 저장
  async saveDeletedUser(deletedUserEntity: DeletedUsersEntity): Promise<DeletedUsersEntity> {
    return await this.deletedUsersRepository.save(deletedUserEntity);
  }

  // 탈퇴된 회원 조회
  async findDeletedUsers() {
    return this.deletedUsersRepository.find();
  }
}
