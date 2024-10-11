import { CookieOptions } from 'express';

const commonOptions = {
  // domain: process.env.COOKIE_DOMAIN,
  httpOnly: true,
};

const sendCookieOptions = (): CookieOptions => {
  // 배포환경
  if (process.env.NODE_ENV === 'production') {
    return {
      ...commonOptions,
      domain: '.caugannies.com',
      secure: true,
      sameSite: 'none',
      maxAge: 2 * 60 * 60 * 1000, // 2시간 (세션 유효기간)
    };
    // 개발환경
  } else {
    return {
      ...commonOptions,
      domain: '.localhost',
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24시간
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
