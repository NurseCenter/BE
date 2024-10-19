export function maskEmail(plainEmail: string): string {
  const [username, domain] = plainEmail?.split('@');
  const visiblePart = username?.slice(0, 2);
  const maskedPart = '*'.repeat(username?.length - 2);
  return `${visiblePart}${maskedPart}@${domain}`;
}
