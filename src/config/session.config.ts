import { ConfigService } from "@nestjs/config";

export function createSessionOptions(configService: ConfigService) {
    return {
        secret: configService.get<string>('SESSION_SECRET') || 'gannies_session_default',
        resave: configService.get<boolean>('SESSION_RESAVE') || false,
        saveUninitialized: configService.get<boolean>('SESSION_SAVE_UNINITIALIZED'),
        // cookie: { secure: true } 
        // 쿠키 옵션은 일단 로그인 되는 거 확인하고 쓰자.
    }
}