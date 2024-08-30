import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { join } from 'path';
import * as ejs from 'ejs';
import { promises as fs } from 'fs';

@Injectable()
export class EmailService {
  private transpoter: nodemailer.Transporter;

  constructor() {
    this.transpoter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  private async renderTemplate(templateName: string, data: any): Promise<string> {
    try {
      const templatePath = join(process.cwd(), 'views', `${templateName}.ejs`);
      const template = await fs.readFile(templatePath, 'utf-8');
      
      return ejs.render(template, data);
    } catch (error) {
      console.error('template rendering error', error);
      throw new Error('Failed to render email template');
    }
  }

  private async send(to: string, subject: string, templateName: string, data: any): Promise<void> {
    try {
      const html = await this.renderTemplate(templateName, data);
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
      };
      await this.transpoter.sendMail(mailOptions);
    } catch (error) {
      console.error("Email Sending Error", error);
      throw new Error('Failed to send Email')
    }
  }

  // 회원가입 후 이메일 발송
  async sendVerificationEmail(to: string, nickname: string, emailVerificationLink: string): Promise<void> {
    const data = { nickname, emailVerificationLink, email: to};
    await this.send(to, '회원가입 인증', 'sign-up-email', data);
  }

  // 임시 비밀번호 발급용 이메일 발송
  async sendTempPasswordEmail(to: string, nickname: string, tempPassword: string): Promise<void> {
    const data = { nickname, tempPassword };
    await this.send(to, '임시 비밀번호 발송', 'reset-password-email', data);
  }
}
