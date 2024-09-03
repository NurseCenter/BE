import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import session from 'express-session';

declare module 'express-session' {
  interface SessionData {
    passport: {
      user: {
        userId: number;
        username: string | null;
        nickname: string;
        phoneNumber: string;
        email: string;
        password: string;
        isTempPassword: boolean | null;
        membershipStatus: number;
        studentStatus: string;
        isAdmin: boolean;
        certificationDocumentUrl: string;
        rejected: boolean;
        createdAt: string;
        suspensionEndDate: string | null;
        deletedAt: string | null;
      };
    };
  }
}

export const SessionUser = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<Request>();
  const user = request.session.passport.user;

  if (!user) {
    return null;
  }

  // 비밀번호 필드를 제외한 새로운 객체 생

  // 비밀번호 필드를 제외한 새로운 객체 생성
  const { password, ...safeUserData } = user;

  if (data) {
    return data === 'password' ? undefined : safeUserData[data as keyof typeof safeUserData];
  }

  return safeUserData;
});
