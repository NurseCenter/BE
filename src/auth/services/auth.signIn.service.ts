import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { LoginsEntity } from '../entities/logins.entity';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersDAO } from 'src/users/users.dao';

@Injectable()
export class AuthSignInService {
  constructor(
    @InjectRepository(LoginsEntity)
    private readonly loginRepository: Repository<LoginsEntity>,
    private readonly usersDAO: UsersDAO,
  ) {}

  // MySQL에 로그인 기록을 저장하기
  async saveLoginRecord(userId: number, req: Request): Promise<boolean> {
    const loggedInUser = await this.usersDAO.findUserByUserId(userId);
    if (!loggedInUser) throw new NotFoundException('해당 회원이 존재하지 않습니다.');

    const loginRecord = new LoginsEntity();
    loginRecord.loginUser = loggedInUser;
    loginRecord.loginIp = await this.getIpAddress(req);
    loginRecord.updatedAt = new Date();

    await this.loginRepository.save(loginRecord);

    return true;
  }

  // 클라이언트 Request의 IP 주소 추출
  async getIpAddress(req: Request): Promise<string> {
    return req.socket.remoteAddress || 'unknown';
  }
}
