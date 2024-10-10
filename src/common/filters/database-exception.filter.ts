import { Catch, ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { QueryFailedError, TypeORMError } from 'typeorm';
import { Response } from 'express';

@Catch(QueryFailedError, TypeORMError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError | TypeORMError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = 500;
    let message = '데이터베이스 오류가 발생했습니다.';

    if (exception instanceof QueryFailedError) {
      const errorCode = (exception as any).code;
      switch (errorCode) {
        case '23503':
          status = 400;
          message = '잘못된 참조 데이터입니다.';
          break;
        case '23502':
          status = 400;
          message = '필수 필드가 누락되었습니다.';
          break;
      }
    }

    // 클라이언트한테 DB 오류 노출시키면 안됨
    // 서버 내에서 콘솔로 찍히게 하기
    response.status(status).json({
      statusCode: status,
      message: message,
      reason: exception.message,
    });
  }
}
