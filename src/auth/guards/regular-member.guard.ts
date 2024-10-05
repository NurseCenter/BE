import { CanActivate, ExecutionContext, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { EMembershipStatus } from 'src/users/enums';
import { UsersDAO } from 'src/users/users.dao';

// 정회원 상태인 회원만 가능
@Injectable()
export class RegularMemberGuard implements CanActivate {
  constructor(private readonly usersDAO: UsersDAO) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request?.user?.userId;

    if (!userId) {
      throw new NotFoundException('회원 ID가 없습니다.');
    }

    const user = await this.usersDAO.findUserByUserId(userId);

    if (!user || !(user?.membershipStatus === EMembershipStatus.APPROVED_MEMBER)) {
      throw new UnauthorizedException('관리자의 인증이 완료된 정회원만 이용 가능합니다.');
    }

    return true;
  }
}
