import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

// 관리자 권한이 있는 사용자만 접근 허용
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request.user?.isAdmin) {
        throw new ForbiddenException("관리자 권한이 없습니다.")
    }
    return true; 
  }
}