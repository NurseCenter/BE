import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from '../users/entities/users.entity';
import { RedisModule } from 'src/common/redis.module';
import { AuthPasswordService, AuthSessionService, AuthSignInService, AuthUserService } from './services/index';
import { LoginsEntity } from './entities/logins.entity';
import { LocalStrategy } from './strategies/local.strategy';
import { SessionSerializer } from './session-serializer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailModule } from 'src/email/email.module';
// import { AuthSmsService } from './services/auth.sms.service';
// import { TwilioModule } from 'nestjs-twilio';
import { AuthTwilioService } from './services/auth.twilio.service';

@Module({
  imports: [TypeOrmModule.forFeature([UsersEntity, LoginsEntity]), RedisModule, ConfigModule, EmailModule,
  // TwilioModule.forRootAsync({
  //   imports: [ConfigModule],
  //   useFactory: async (configService: ConfigService) => ({
  //     accountSid: configService.get<string>('TWILIO_ACCOUNT_SID'),
  //     authToken: configService.get<string>('TWILIO_AUTH_TOKEN'),
  //     phoneNumber: configService.get<string>('TWILIO_PHONE_NUMBER'),
  //     verifyServiceSid: configService.get<string>('TWILIO_SERVICE_SID'),
  //   }),
  //   inject: [ConfigService],
  // }), 
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthUserService,
    AuthPasswordService,
    AuthSignInService,
    AuthSessionService,
    AuthTwilioService,
    LocalStrategy,
    SessionSerializer,
  ],
})
export class AuthModule {}
