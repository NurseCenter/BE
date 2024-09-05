import { DeletedUsersEntity } from 'src/admin/entities';

export const mockDeletedUsers: DeletedUsersEntity[] = [
  {
    id: 1,
    userId: 1,
    deletionReason: '신고당한 횟수가 100회임!',
    deletedAt: new Date('2023-02-01T00:00:00Z'),
  },
  {
    id: 2,
    userId: 5,
    deletionReason: '잘 가십쇼',
    deletedAt: new Date('2023-02-01T00:00:00Z'),
  },
  {
    id: 3,
    userId: 8,
    deletionReason: '인증을 제대로 하지 않고 계속 가입시도함.',
    deletedAt: new Date('2023-02-01T00:00:00Z'),
  },
];
