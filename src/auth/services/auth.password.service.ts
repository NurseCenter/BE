import { Injectable } from "@nestjs/common";
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthPasswordService {
    // 비밀번호 생성
    async createPassword(plainPassword: string): Promise<string> {
        const hashedPassword = await bcrypt.hash(plainPassword, 15);
        return hashedPassword;
    }

    // 비밀번호 일치 검사
    async matchPassword(inputPassword: string, storedPassword: string): Promise<boolean>{
        const isPasswordMatch = await bcrypt.compare(inputPassword, storedPassword);
        return isPasswordMatch;
    }
}