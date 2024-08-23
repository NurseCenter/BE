import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from 'src/users/entities/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UsersEntity])],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
