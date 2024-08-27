import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import path from 'path';
import ejs from 'ejs';
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
                pass: process.env.EMAIL_PASS
            }
        })
    }

    async sendEmail(to: string, subject: string, templateName: string, data: any): Promise<void>  {
        const templatePath = path.join(__dirname, '..', 'email', 'templates', `${templateName}.ejs`);
        const template = await fs.readFile(templatePath, 'utf-8');
        const html = ejs.render(template, data);

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to,
            subject,
            html,
        };

        await this.transpoter.sendMail(mailOptions);
    }
}