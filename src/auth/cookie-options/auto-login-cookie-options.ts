import { CookieOptions } from 'express';

const commonAutoLoginOptions = {
  domain: process.env.COOKIE_DOMAIN,
  maxAge: 365 * 24 * 60 * 60 * 1000, // 1년 (자동로그인 쿠키 유효기간)
};

const sendAutoLoginCookieOptions = (): CookieOptions => {
  // 배포환경
  if (process.env.NODE_ENV === 'production') {
    return {
      ...commonAutoLoginOptions,
      secure: true,
      sameSite: 'none',
    };
  } else {
    // 개발환경
    return {
      ...commonAutoLoginOptions,
      secure: false,
      sameSite: 'lax',
    };
  }
};

export { sendAutoLoginCookieOptions };

/*
개발환경
{
  "domain": process.env.COOKIE_DOMAIN,
  "maxAge": 31536000000,
  "secure": false,
  "sameSite": "lax" 
}

배포환경
{
  "domain": process.env.COOKIE_DOMAIN,
  "maxAge": 31536000000,
  "secure": true,
  "sameSite": "none" 
}
*/
