import { CookieOptions } from 'express';
import { sendAutoLoginCookieOptions } from './auto-login-cookie-options';

const clearAutoLoginCookieOptions = (): CookieOptions => {
  const options = sendAutoLoginCookieOptions();
  return {
    ...options,
    expires: new Date(Date.now() - 1000),
    maxAge: 0,
  };
};

export default clearAutoLoginCookieOptions;
