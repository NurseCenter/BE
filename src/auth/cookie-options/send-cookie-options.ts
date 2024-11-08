import { CookieOptions } from 'express';

const sendCookieOptions = (): CookieOptions => {
  // 배포환경
  if (process.env.NODE_ENV === 'production') {
    return {
      secure: true,
      httpOnly: true,
      sameSite: 'none',
      maxAge: 2 * 60 * 60 * 1000, // 2시간
    };
    // 개발환경
  } else {
    return {
      secure: false,
      sameSite: 'lax',
      // maxAge: 24 * 60 * 60 * 1000, // 24시간
      maxAge: 2 * 60 * 1000, // 2분 (테스트)
    };
  }
};

export { sendCookieOptions };
