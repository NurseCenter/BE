import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { IUser } from '../interfaces';

declare module 'express-session' {
  interface SessionData {
    passport: {
      user: IUser; // userId와 email만 존재
    };
  }
}

export const SessionUser = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<Request>();
  const user = request.session.passport.user;

  if (!user) {
    return null;
  }

  // userId 또는 email만 반환
  if (data) {
    return user[data as keyof typeof user];
  }

  return user;
});
