import { Module } from '@nestjs/common';
import { UsersDAO } from './users.dao';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from '../entities/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UsersEntity])],
  providers: [UsersDAO],
  exports: [UsersDAO]
})
export class DataAccessModule {}