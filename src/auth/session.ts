import { Injectable } from "@nestjs/common";
import { PassportSerializer, PassportStrategy } from "@nestjs/passport";

@Injectable()
export class Session extends PassportSerializer {
    // 사용자 정보를 직렬화하여 세션에 저장
    serializeUser(user: any, done: (err: Error, use: any) => void,): void {
        done(null, user);
    }

    // 세션에서 사용자 정보를 역직렬화하여 반환
    deserializeUser(payload: string, done: (err: Error, payload: string) => void): void {
        done(null, payload);
    }
}   