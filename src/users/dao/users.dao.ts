import { Injectable } from '@nestjs/common';
import { UsersEntity } from 'src/users/entities/users.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/auth/dto';

@Injectable()
export class UsersDAO {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly userRepository: Repository<UsersEntity>
  ) {}

  // 회원 엔티티 생성
  async createUser(createUserDto: CreateUserDto): Promise<UsersEntity> {
    const newUser = new UsersEntity();
    Object.assign(newUser, createUserDto);
    return newUser;
  }

  // 회원 최신 정보 Repository에 저장하기
  async saveUser(user: UsersEntity): Promise<UsersEntity> {
    return this.userRepository.save(user);
  }

  // 이메일로 회원 찾기
  async findUserByEmail(email: string): Promise<UsersEntity | undefined> {
    return this.userRepository.findOne({ where: { email } });
  }

  // 회원 ID로 회원 찾기
  async findUserByUserId(userId: number): Promise<UsersEntity | undefined> {
    return this.userRepository.findOne({ where: { userId } });
  }

  // 회원 실명과 휴대폰 번호로 회원 찾기
  async findUserByUsernameAndPhone(username: string, phoneNumber: string): Promise<UsersEntity | undefined> {
    return this.userRepository.findOne({ where: { username, phoneNumber } });
  }

  // 회원 실명과 이메일로 회원 찾기
  async findUserByUsernameAndEmail(username: string, email: string): Promise<UsersEntity | undefined> {
    return this.userRepository.findOne({ where: { username, email } });
  }
}
