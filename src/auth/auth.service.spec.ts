// import { Test, TestingModule } from '@nestjs/testing';
// import { AuthService } from './auth.service';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { UsersEntity } from 'src/users/entities/users.entity';
// import { Repository } from 'typeorm';
// import * as bcrypt from 'bcrypt'
// import { EStudentStatus } from 'src/users/enums';

// describe('AuthService', () => {
//   let service: AuthService;
//   let userRepository: Repository<UsersEntity>

//   // 테스트 모듈 설정, AuthService와 UsersEntity의 Repository를 Mocking 
//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [AuthService,
//         {
//           provide: getRepositoryToken(UsersEntity),
//           useValue: {
//             create: jest.fn(),
//             save: jest.fn(),
//           },
//         },
//       ],
//     }).compile();

//     service = module.get<AuthService>(AuthService);
//     userRepository = module.get<Repository<UsersEntity>>(getRepositoryToken(UsersEntity));
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });

//   // createUser 테스트
// describe('createUser', () => {
//   it('should save a new user with a hashed password', async () => {
//     const createUserDto = {
//       nickname: 'GoGildong',
//       email: 'gildong@example.com',
//       password: 'Aa1!secure',
//       status: EStudentStatus.CURRENT_STUDENT,
//       certificationDocumentUrl : 'http://example.com/cert',  
//     }

//     const hashedPassword = await bcrypt.hash(createUserDto.password, 15);

//     // 비밀번호 해시 메서드 모킹
//     jest.spyOn(service, 'createPassword').mockResolvedValue(hashedPassword);

//     // userRepository.save 메서드 모킹
//     jest.spyOn(userRepository, 'save').mockResolvedValue(createUserDto as any);

//     await service.createUser(createUserDto);

//     expect(userRepository.save).toHaveBeenCalledWith({
//       ...createUserDto,
//       password: hashedPassword,
//       });
//     });
//   });
// });