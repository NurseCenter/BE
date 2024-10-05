import { ESuspensionDuration } from 'src/admin/enums';

// 정지 기간 클라이언트 반환시 포맷 변경
export function formatSuspensionDuration(duration: ESuspensionDuration): string {
  switch (duration) {
    case ESuspensionDuration.ONE_WEEK:
      return '1주';
    case ESuspensionDuration.TWO_WEEKS:
      return '2주';
    case ESuspensionDuration.THREE_WEEKS:
      return '3주';
    case ESuspensionDuration.FOUR_WEEKS:
      return '4주';
    default:
      return '알 수 없는 기간';
  }
}
