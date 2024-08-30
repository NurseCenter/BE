import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

// 관리자 권한이 있는 사용자만 접근 허용
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    return request.user?.isAdmin; 
  }
}