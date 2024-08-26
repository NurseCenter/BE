import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { LoginsEntity } from "../entities/logins.entity";
import { Request } from 'express';
import { AuthUserService } from './auth.user.service';
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class AuthSignInService {
    constructor(
        @InjectRepository(LoginsEntity)
        private readonly loginRepository: Repository<LoginsEntity>,
        private readonly authUserService: AuthUserService,
    ){}

    // MySQL에 로그인 기록을 저장하기
    async saveLoginRecord(userId: string, req: Request): Promise<void> {
        const loggedInUser = await this.authUserService.findUserByUserId(userId);
        if (!loggedInUser) throw new Error('User not found');

        const loginRecord = new LoginsEntity();
        loginRecord.loginUser = loggedInUser;
        loginRecord.loginIp = await this.getIpAddress(req);
        loginRecord.isTemporaryPassword = null;
        loginRecord.updatedAt = new Date();

        await this.loginRepository.save(loginRecord);
    }

    // 클라이언트 Request의 IP 주소 추출
    async getIpAddress(req: Request): Promise<string> {
        return req.socket.remoteAddress || 'unknown';
    }
}