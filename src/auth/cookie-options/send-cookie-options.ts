import { CookieOptions } from 'express';

const commonOptions = {
  // domain: process.env.COOKIE_DOMAIN,
  // maxAge: 1 * 60 * 1000, // 1분 (테스트용)
  maxAge: 2 * 60 * 60 * 1000, // 2시간 (세션 유효기간)
  httpOnly: true,
};

const sendCookieOptions = (): CookieOptions => {
  // 배포환경
  if (process.env.NODE_ENV === 'production') {
    return {
      ...commonOptions,
      secure: false,
      sameSite: 'lax',
      // secure: true,
      // sameSite: 'none',
    };
    // 개발환경
  } else {
    return {
      ...commonOptions,
      secure: false,
      sameSite: 'lax',
    };
  }
};

export { sendCookieOptions };

/*
개발환경
{
  "domain": process.env.COOKIE_DOMAIN,
  "maxAge": 86400000,
  "httpOnly": true,
  "secure": false,
  "sameSite": "lax" 
}

배포환경
{
  "domain": process.env.COOKIE_DOMAIN,
  "maxAge": 86400000,
  "httpOnly": true,
  "secure": true,
  "sameSite": "none" 
}
*/
