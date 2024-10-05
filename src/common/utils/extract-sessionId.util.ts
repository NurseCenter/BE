export function extractSessionIdFromCookie(sessionId: string) {
  return sessionId?.split('.')[0].replace(/^s:/, '');
}
