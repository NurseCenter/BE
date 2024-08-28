import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { TwilioService } from 'nestjs-twilio';
import { generateRandomNumber } from 'src/common/random.utils';

@Injectable()
export class AuthSmsService {
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis
    public constructor(private readonly twilioService: TwilioService
  ) {}

  // 휴대폰 인증을 위한 6자리 랜덤 번호 생성
  private async generateAuthCode(): Promise<string> {
    const randomNumber = generateRandomNumber(1, 6).join("");
    return randomNumber
  }

  // 인증번호와 함께 SMS를 전송
  async sendPhoneVerificationCode(phoneNumber: string): Promise<string> {
    const authCode = await this.generateAuthCode();

    await this.twilioService.client.messages.create({
      body: `중간이들 휴대폰 인증번호 ${authCode}를 입력해주세요.`,
      from: process.env.TWILIO_PHONE_NUMBER, 
      to: phoneNumber,
    });

    // 인증번호를 Redis에 저장하고 TTL을 설정 (3분)
    await this.redisClient.setex(`authCode:${phoneNumber}`, 180, authCode);

    return authCode;
  }

  // 인증번호 검증 후 삭제
  async verifyAuthCode(phoneNumber: string, code: string): Promise<boolean> {
    const storedCode = await this.redisClient.get(`authCode:${phoneNumber}`);

    if (storedCode === code) {
      await this.redisClient.del(`authCode:${phoneNumber}`);
      return true;
    }
    
    return false;
  }
}