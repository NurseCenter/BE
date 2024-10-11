export function extractSessionIdFromCookie(cookie: string) {
  // 쿠키가 없을 경우 null 반환
  if (!cookie) {
    return null;
  }

  let sessionId = null;

  // 쿠키가 여러 개 있을 때
  if (cookie.includes(';')) {
    const cookieArray = cookie.split('; ').map((c) => c.trim());

    const connectSidCookie = cookieArray.find((c) => c.startsWith('connect.sid='));
    if (connectSidCookie) {
      sessionId = connectSidCookie.split('=')[1];
    }
  } else {
    // 쿠키가 connect.sid 1개만 있을 때
    if (cookie.startsWith('connect.sid=')) {
      sessionId = cookie.split('=')[1];
    }
  }

  return sessionId?.split('.')[0].replace(/^s:/, '') || null;
}
