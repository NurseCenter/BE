import { BadRequestException } from '@nestjs/common';

// 인증번호 발급받을 때 전화번호 형식이 잘못된 경우
export class InvalidPhoneNumberException extends BadRequestException {
  constructor() {
    super({
      message: '잘못된 전화번호 형식입니다. 전화번호는 01012345678과 같은 숫자 11자리로 이루어진 문자열입니다.',
      error: 'Invalid PhoneNumber Request Type',
      statusCode: 400,
    });
  }
}

// 잘못된 인증 코드를 입력한 경우
export class InvalidPhoneVerificationCodeException extends BadRequestException {
  constructor() {
    super({
      message: '잘못된 인증 코드입니다. 입력한 코드를 다시 확인해주세요.',
      error: 'Invalid Verification Code',
      statusCode: 400,
    });
  }
}

// 인증 내역 요청이 없는 경우
export class NoPhoneVerificationRecordException extends BadRequestException {
  constructor() {
    super({
      message: '해당 전화번호에 대한 인증내역 요청이 없거나 인증 유효 시간(10분)이 지났습니다.',
      error: 'No Verification Record',
      statusCode: 400,
    });
  }
}

// 이미 인증이 완료된 경우
export class AlreadyPhoneVerifiedException extends BadRequestException {
  constructor() {
    super({
      message: '이미 인증이 완료된 전화번호입니다.',
      error: 'Already Verified',
      statusCode: 409,
    });
  }
}

// 최대 인증 횟수를 초과한 경우
export class MaxCheckAttemptsException extends BadRequestException {
  constructor() {
    super({
      message: '최대 인증 시도 횟수(5회)에 도달했습니다. 인증을 처음부터 다시 시도해주세요.',
      error: 'Max Check Attempts Reached',
      statusCode: 400,
    });
  }
}
