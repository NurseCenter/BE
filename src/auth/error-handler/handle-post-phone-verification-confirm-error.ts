import { InternalServerErrorException } from '@nestjs/common';
import {
  InvalidPhoneVerificationCodeException,
  NoPhoneVerificationRecordException,
  MaxCheckAttemptsException,
  InvalidPhoneNumberException,
} from 'src/common/exceptions/twilio-sms.exceptions';

export function handlePostPhoneVerificationConfirmError(error: any): void {
  console.error('Error: ', error);

  // 입력한 전화번호 형식이 유효하지 않은 경우
  if (error.code === 60200) {
    throw new InvalidPhoneNumberException();
  }

  // 인증번호가 불일치할 때
  if (error instanceof InvalidPhoneVerificationCodeException) {
    throw new InvalidPhoneVerificationCodeException();
  }

  // 해당 번호에 대한 인증내역이 없는 경우
  if (error.code === 20404) {
    throw new NoPhoneVerificationRecordException();
  }

  // 최대 인증 횟수에 도달한 경우
  if (error.code === 60202) {
    throw new MaxCheckAttemptsException();
  }

  // 그 외의 예외는 Internal Server Error로 처리
  throw new InternalServerErrorException('서버에서 오류가 발생했습니다.');
}
