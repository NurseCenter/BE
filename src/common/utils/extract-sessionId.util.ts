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

  // s:gwfjJhtTypuHs2a38Rr일 경우
  // → 's:' 제거 후 변환
  if (cookie.startsWith('s:')) {
    return cookie?.split('.')[0].replace(/^s:/, '');
  }

  const result = sessionId?.split('.')[0].replace(/^s:/, '') || null;

  return result;
}
