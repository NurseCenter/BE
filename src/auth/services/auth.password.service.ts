import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthPasswordService {
  // 비밀번호 생성
  async createHashedPassword(plainPassword: string): Promise<string> {
    const hashedPassword = await bcrypt.hash(plainPassword, 15);
    return hashedPassword;
  }

  // 비밀번호 일치 검사
  async matchPassword(inputPassword: string, storedPassword: string): Promise<boolean> {
    const isPasswordMatch = await bcrypt.compare(inputPassword, storedPassword);
    return isPasswordMatch;
  }

  // 임시 비밀번호 생성
  async createTempPassword(): Promise<string> {
    return randomBytes(8).toString('hex');
  }
}
