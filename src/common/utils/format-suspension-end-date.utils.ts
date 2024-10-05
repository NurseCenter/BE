export function formatSuspensionEndDate(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1; // 0부터 시작하므로 1을 더해줌
  const day = d.getDate();
  const hours = d.getHours();
  const minutes = d.getMinutes();

  return `${year}년 ${month}월 ${day}일 ${hours}시 ${minutes}분`;
}
