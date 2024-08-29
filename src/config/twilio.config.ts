import { ConfigService } from "@nestjs/config";

export interface TwilioConfig {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
}

export const getTwilioConfig = (configService: ConfigService): TwilioConfig => ({
    accountSid: configService.get<string>('TWILIO_ACCOUNT_SID'),
    authToken: configService.get<string>('TWILIO_AUTH_TOKEN'),
    phoneNumber: configService.get<string>('TWILIO_PHONE_NUMBER'),
});