import { CookieOptions } from 'express';
import { sendCookieOptions } from './send-cookie-options';

const clearCookieOptions = (): CookieOptions => {
  const options = sendCookieOptions();
  return {
    ...options,
    expires: new Date(Date.now() - 1000), // 쿠키 만료를 위해 과거 날짜로 설정
    maxAge: 0,
  };
};

export default clearCookieOptions;
