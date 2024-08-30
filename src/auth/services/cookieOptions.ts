const commonOptions = {
  domain: process.env.COOKIE_DOMAIN,
  maxAge: 24 * 60 * 60 * 1000,
  httpOnly: true,
};

const getCookieOptions = async () => {
  let additionalOptions = {};

  if (process.env.NODE_ENV === 'production') {
    additionalOptions = {
      secure: true,
      sameSite: 'none',
    };
  } else {
    additionalOptions = {
      httpOnly: false,
      sameSite: true,
    };
  }

  return { ...commonOptions, ...additionalOptions };
};

export default getCookieOptions;
