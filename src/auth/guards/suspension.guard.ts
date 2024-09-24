import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersDAO } from 'src/users/users.dao';

@Injectable()
export class SuspensionGuard implements CanActivate {
  constructor(private readonly usersDAO: UsersDAO) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;

    if (!userId) {
      throw new UnauthorizedException('로그인한 회원한 이용 가능합니다.');
    }

    const user = await this.usersDAO.findUserByUserId(userId); 
    if (user && user.suspensionEndDate && user.suspensionEndDate > new Date()) {
        const daysRemaining = Math.ceil((user.suspensionEndDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
        throw new UnauthorizedException(`현재 계정이 정지 상태입니다. ${daysRemaining}일 후에 해제됩니다. 마이페이지에서 확인해 주세요.`);
      }
  
    return true;
  }
}