import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

// 정회원 상태인 회원만 가능
@Injectable()
export class RegularMemberGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    return request.user?.membershipStatus === 3;
  }
}