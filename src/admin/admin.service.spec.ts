// import { Test, TestingModule } from '@nestjs/testing';
// import { AdminService } from './admin.service';
// import { AdminDAO } from './admin.dao';
// import { mockDeletedUsers } from 'src/_mock/deleted-users.mock';
// import { mockSuspendedUsers } from 'src/_mock/suspended-users.mock';
// import { mockUsers } from 'src/_mock/users.mock';
// import { PaginationDto } from './dto/pagination.dto';
// import { UserListDto } from './dto/user-list.dto';
// import { mockUsersEqual } from 'src/_mock/users-equal.mock';

// describe('AdminService', () => {
//   let service: AdminService;
//   let dao: AdminDAO;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         AdminService,
//         {
//           provide: AdminDAO,
//           useValue: {
//             findUsersWithDetails: jest.fn(),
//             findSuspendedUsers: jest.fn(),
//             findDeletedUsers: jest.fn()
//           },
//         },
//       ],
//     }).compile();

//     service = module.get<AdminService>(AdminService);
//     dao = module.get<AdminDAO>(AdminDAO);
//   });

//   it('페이지네이션된 상태로 전체 회원 목록 조회', async () => {
//     jest.spyOn(dao, 'findUsersWithDetails').mockResolvedValue([mockUsers, 8]);
//     jest.spyOn(dao, 'findSuspendedUsers').mockResolvedValue(mockSuspendedUsers);
//     jest.spyOn(dao, 'findDeletedUsers').mockResolvedValue(mockDeletedUsers);

//     const result: PaginationDto<UserListDto> = await service.fetchAllUsersByAdmin(1, 10);

//     expect(result.totalItems).toBe(8);
//     expect(result.totalPages).toBe(1);
//     expect(result.items).toEqual(mockUsersEqual)

//     expect(service).toBeDefined();
//   });
// });
