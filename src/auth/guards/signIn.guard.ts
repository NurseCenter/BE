import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

// 로그인된 사용자만 접근 허용
@Injectable()
export class SignInGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    return !!request.user; 
  }
}