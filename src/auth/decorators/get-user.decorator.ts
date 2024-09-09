import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { IUser } from '../interfaces';

declare module 'express-session' {
  interface SessionData {
    passport: {
      user: IUser;
    };
  }
}

export const SessionUser = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<Request>();
  const user = request.session.passport.user;

  if (!user) {
    return null;
  }

  // 비밀번호 필드를 제외한 새로운 객체 생성
  const { password, ...safeUserData } = user;

  if (data) {
    return data === 'password' ? undefined : safeUserData[data as keyof typeof safeUserData];
  }

  return safeUserData;
});
