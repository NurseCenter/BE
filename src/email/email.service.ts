import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { join } from 'path';
import * as ejs from 'ejs';
import { promises as fs } from 'fs';
import { ConversionUtil } from 'src/common/utils';

@Injectable()
export class EmailService {
  private transpoter: nodemailer.Transporter;
  private readonly frontEndLoginPageUrl: string;
  private readonly adminEmail: string;

  constructor() {
    this.transpoter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: ConversionUtil.stringToNumber(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    this.frontEndLoginPageUrl = process.env.FRONT_END_LOGIN_PAGE_URL || 'http://localhost:5173';
    this.adminEmail = process.env.ADMIN_EMAIL;
  }

  private async renderTemplate(templateName: string, data: any): Promise<string> {
    try {
      const templatePath = join(process.cwd(), 'views', `${templateName}.ejs`);
      const template = await fs.readFile(templatePath, 'utf-8');

      return ejs.render(template, data);
    } catch (error) {
      console.error('이메일 템플릿 렌더링 중 오류 발생: ', error);
      throw new InternalServerErrorException('이메일 템플릿 렌더링 중 오류 발생');
    }
  }

  private async send(to: string, subject: string, templateName: string, data: any): Promise<void> {
    try {
      const emailData = { ...data, frontEndLoginPageUrl: this.frontEndLoginPageUrl, adminEmail: this.adminEmail };
      const html = await this.renderTemplate(templateName, emailData);
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
      };
      await this.transpoter.sendMail(mailOptions);
    } catch (error) {
      console.error('이메일 전송 중 오류 발생: ', error);
      throw new InternalServerErrorException('이메일 전송 중 오류 발생');
    }
  }

  // 회원가입 후 이메일 발송
  async sendVerificationEmail(to: string, nickname: string, emailVerificationLink: string): Promise<void> {
    const data = { nickname, emailVerificationLink, email: to };
    await this.send(to, '중간이들 회원가입 인증', 'sign-up-email', data);
  }

  // 임시 비밀번호 발급용 이메일 발송
  async sendTempPasswordEmail(to: string, nickname: string, tempPassword: string): Promise<void> {
    const data = { nickname, tempPassword };
    await this.send(to, '중간이들 임시 비밀번호 발송', 'reset-password-email', data);
  }

  // 정회원 승인 거절 이메일 발송
  async sendMembershipRejectionEmail(to: string, nickname: string, rejectedReason: string): Promise<void> {
    const data = { nickname, rejectedReason };
    await this.send(to, '중간이들 정회원 승인 보류 안내', 'regular-member-rejection-email', data);
  }

  // 정회원 승인 완료 이메일 발송
  async sendMembershipApprovalEmail(to: string, nickname: string): Promise<void> {
    const data = { nickname };
    await this.send(to, '중간이들 정회원 승인 완료 안내', 'regular-member-approval-email', data);
  }

  // 계정 활동 정지 이메일 발송
  async sendAccountSuspensionEmail(
    to: string,
    nickname: string,
    suspensionEndDate: string,
    suspensionDuration: string,
    suspensionReason: string,
  ): Promise<void> {
    const data = { nickname, suspensionEndDate, suspensionDuration, suspensionReason };
    await this.send(to, '중간이들 계정 활동 정지 안내', 'member-suspension-email', data);
  }

  // 강제 탈퇴 안내 이메일 발송
  async sendForcedWithdrawalEmail(to: string, nickname: string, deletionReason: string): Promise<void> {
    const data = { nickname, deletionReason };
    await this.send(to, '중간이들 회원 탈퇴 통지', 'member-deletion-email', data);
  }

  // 이메일 발송 테스트
  async sendEmailForTest(to: string): Promise<void> {
    await this.send(to, '이메일 발송 테스트', 'test-email', to);
  }
}
