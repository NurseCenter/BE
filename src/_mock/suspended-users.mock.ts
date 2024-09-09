import { SuspendedUsersEntity } from 'src/admin/entities';
import { ESuspensionDuration } from 'src/admin/enums';

export const mockSuspendedUsers: SuspendedUsersEntity[] = [
  {
    id: 1,
    userId: 1,
    suspensionReason: '공지사항의 커뮤니티 수칙 위반 연속 2회',
    suspensionDuration: ESuspensionDuration.THREE_WEEKS,
    suspensionEndDate: new Date('2023-01-15T00:00:00Z'),
    createdAt: new Date('2023-01-01T00:00:00Z'),
    deletedAt: null,
  },
  {
    id: 2,
    userId: 4,
    suspensionReason: '너무 힘들게 했음. 적당히 하자.',
    suspensionDuration: ESuspensionDuration.FOUR_WEEKS,
    suspensionEndDate: new Date('2023-03-31T00:00:00Z'),
    createdAt: new Date('2023-03-01T00:00:00Z'),
    deletedAt: null,
  },
  {
    id: 3,
    userId: 5,
    suspensionReason: '부적절한 언행.',
    suspensionDuration: ESuspensionDuration.TWO_WEEKS,
    suspensionEndDate: new Date('2023-05-15T00:00:00Z'),
    createdAt: new Date('2023-05-01T00:00:00Z'),
    deletedAt: null,
  },
];
