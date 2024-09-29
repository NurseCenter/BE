import * as twilio from 'twilio';

export class AuthTwilioService {
  private client: twilio.Twilio;
  private accountSid = process.env.TWILIO_ACCOUNT_SID;
  private authToken = process.env.TWILIO_AUTH_TOKEN;
  private verifyServiceSid = process.env.TWILIO_SERVICE_SID;

  constructor() {
    this.client = twilio(this.accountSid, this.authToken);
  }

  // 인증번호를 담은 메시지 보내기
  sendVerificationCode(options: { to: string }) {
    return this.client.verify.v2
      .services(this.verifyServiceSid)
      .verifications.create({ to: options.to, channel: 'sms' });
  }

  // 전송한 메시지 인증번호 확인하기
  async checkVerificationCode(options: { to: string; code: string }) {
    const result = await this.client.verify.v2.services(this.verifyServiceSid).verificationChecks.create({
      to: options.to,
      code: options.code,
    });

    return result;
  }
}
