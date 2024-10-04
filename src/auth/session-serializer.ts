import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { IUser } from './interfaces';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  // 사용자 정보를 직렬화하여 세션에 저장
  serializeUser(user: IUser, done: (err: Error | null, user: IUser) => void): void {
    // console.log('serializeUser, user', user);
    const { userId, email } = user;
    done(null, { userId, email });
  }

  // 세션에서 사용자 정보를 역직렬화하여 반환
  deserializeUser(payload: IUser, done: (err: Error | null, user: IUser) => void): void {
    // console.log('deserializeUser, payload', payload);
    done(null, payload);
  }
}
