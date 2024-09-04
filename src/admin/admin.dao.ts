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
}