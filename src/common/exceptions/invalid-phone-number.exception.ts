import { BadRequestException } from '@nestjs/common';

export class InvalidPhoneNumberException extends BadRequestException {
  constructor() {
    super({
      message: '잘못된 전화번호 형식입니다. 전화번호는 01012345678과 같은 숫자 11자리로 이루어진 문자열입니다.',
      error: 'Bad Request',
      statusCode: 400,
    });
  }
}