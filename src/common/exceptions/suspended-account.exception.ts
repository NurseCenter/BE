import { UnauthorizedException } from '@nestjs/common';

export class SuspendedAccountException extends UnauthorizedException {
  constructor(message: string) {
    super({
      message,
      error: 'Unauthorized',
      statusCode: 401,
      isSuspended: true, // 계정 정지 여부
    });
  }
}
