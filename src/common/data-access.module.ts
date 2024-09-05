import { Module } from '@nestjs/common';
import { UsersDAO } from '../users/users.dao';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from '../users/entities/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UsersEntity])],
  providers: [UsersDAO],
  exports: [UsersDAO],
})
export class DataAccessModule {}
