import { NotFoundException } from '@nestjs/common';
import { UsersEntity } from 'src/users/entities/users.entity';

export async function throwIfUserNotExists(user: UsersEntity | null, userId?: number, email?: string): Promise<void> {
  if (!user) {
    if (userId === undefined || userId === null) {
      if (email) {
        throw new NotFoundException(`이메일이 ${email}인 회원이 존재하지 않습니다.`);
      } else {
        throw new NotFoundException(`해당 회원이 존재하지 않습니다.`);
      }
    }
    throw new NotFoundException(`ID가 ${userId}인 회원이 존재하지 않습니다.`);
  }
}
