import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UsersEntity } from 'src/users/entities/users.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataAccessModule } from 'src/common/data-access.module';

@Module({
  imports: [TypeOrmModule.forFeature([UsersEntity]), DataAccessModule], 
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
