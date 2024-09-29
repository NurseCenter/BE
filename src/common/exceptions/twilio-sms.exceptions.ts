import { BadRequestException } from '@nestjs/common';
import { BaseErrorResponse } from '../dto/base-error-response.dto';

export class InvalidPhoneNumberException extends BadRequestException {
  constructor() {
    super(new BaseErrorResponse(
      '잘못된 전화번호 형식입니다. 전화번호는 01012345678과 같은 숫자 11자리로 이루어진 문자열입니다.',
      'Invalid PhoneNumber Request Type',
      400
    ));
  }
}

export class InvalidPhoneVerificationCodeException extends BadRequestException {
  constructor() {
    super(new BaseErrorResponse(
      '잘못된 인증 코드입니다. 입력한 코드를 다시 확인해주세요.',
      'Invalid Verification Code',
      400
    ));
  }
}

export class NoPhoneVerificationRecordException extends BadRequestException {
  constructor() {
    super(new BaseErrorResponse(
      '해당 전화번호에 대한 인증내역 요청이 없거나 인증 유효 시간(10분)이 지났습니다.',
      'No Verification Record',
      400
    ));
  }
}

export class AlreadyPhoneVerifiedException extends BadRequestException {
  constructor() {
    super(new BaseErrorResponse(
      '이미 인증이 완료된 전화번호입니다.',
      'Already Verified',
      409
    ));
  }
}

export class MaxCheckAttemptsException extends BadRequestException {
  constructor() {
    super(new BaseErrorResponse(
      '최대 인증 시도 횟수(5회)에 도달했습니다. 인증을 처음부터 다시 시도해주세요.',
      'Max Check Attempts Reached',
      400
    ));
  }
};