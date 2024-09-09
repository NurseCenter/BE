import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

// 로그인된 사용자만 접근 허용
@Injectable()
export class SignInGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request.user) {
      throw new ForbiddenException('로그인한 회원한 이용 가능합니다.');
    }

    return true;
  }
}
