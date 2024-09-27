import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuspendedUsersEntity } from '../entities';
import { ESuspensionDuration } from '../enums';
import { ConversionUtil } from 'src/common/utils/conversion.utils';
import { ISuspendedUserInfoResponse } from '../interfaces';

@Injectable()
export class SuspendedUsersDAO {
  constructor(
    @InjectRepository(SuspendedUsersEntity)
    private readonly suspendedUsersRepository: Repository<SuspendedUsersEntity>,
  ) {}

  // 회원 정지 시 SuspendedUsersEntity에 새로운 엔티티 객체를 생성
  async createSuspendedUser(userId: number): Promise<SuspendedUsersEntity> {
    const newSuspendedUser = this.suspendedUsersRepository.create({ userId });
    return newSuspendedUser;
  }

  // SuspendedUsersEntity에 저장
  async saveSuspendedUser(suspendedUserEntity: SuspendedUsersEntity): Promise<SuspendedUsersEntity> {
    return await this.suspendedUsersRepository.save(suspendedUserEntity);
  }

  // 정지된 회원 전체 조회
  async findSuspendedUsers(): Promise<SuspendedUsersEntity[]> {
    return this.suspendedUsersRepository.find({ where: { deletedAt: null } });
  }

  // 특정 정지된 회원 조회
  async findSuspendedUserByUserId(userId: number): Promise<SuspendedUsersEntity> {
    const suspendedUser = await this.suspendedUsersRepository.findOne({
      where: { userId },
      withDeleted: true,
    });
    return suspendedUser;
  }

  // 특정 회원의 정지 내역 정보 제공
  async findSuspendedUserInfoByUserId(userId: number): Promise<ISuspendedUserInfoResponse> {
    const suspendedUser = await this.suspendedUsersRepository.findOne({
      where: { userId },
    });

    // suspendedUser가 없을 경우 null 반환
    if (!suspendedUser) {
      return null;
    }

    const { toKST } = ConversionUtil;
    const { suspensionDuration, suspensionEndDate, suspensionReason } = suspendedUser;
    const formattedDuration = this.formatSuspensionDuration(suspensionDuration);

    return {
      userId,
      suspensionDuration: formattedDuration,
      suspensionEndDate: toKST(suspensionEndDate),
      suspensionReason,
    };
  }

  // 정지 기간 클라이언트 반환시 포맷 변경
  private formatSuspensionDuration(duration: ESuspensionDuration): string {
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
}
