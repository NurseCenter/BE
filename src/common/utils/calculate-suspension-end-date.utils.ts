import { NotFoundException } from '@nestjs/common';
import { ESuspensionDuration } from 'src/admin/enums';
import * as dayjs from 'dayjs';

// 정지 날짜 계산
export function calculateSuspensionEndDate(duration: ESuspensionDuration): Date {
  const now = dayjs();

  switch (duration) {
    case ESuspensionDuration.ONE_WEEK:
      return now.add(1, 'week').toDate();
    case ESuspensionDuration.TWO_WEEKS:
      return now.add(2, 'week').toDate();
    case ESuspensionDuration.THREE_WEEKS:
      return now.add(3, 'week').toDate();
    case ESuspensionDuration.FOUR_WEEKS:
      return now.add(4, 'week').toDate();
    default:
      throw new NotFoundException('입력된 기간이 유효하지 않습니다.');
  }
}
