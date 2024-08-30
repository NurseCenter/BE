import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

// 정회원 상태인 회원만 가능
@Injectable()
export class RegularMemberGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean>{
    const request = context.switchToHttp().getRequest();

    if (!(request.user?.membershipStatus === 3)) {
        throw new UnauthorizedException("관리자의 인증이 완료된 후 정회원만 이용 가능합니다.")
    }

    return true;
  }
}