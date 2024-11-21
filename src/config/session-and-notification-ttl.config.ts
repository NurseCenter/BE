export interface SessionAndNotificationTTLConfig {
    sessionTTL: number; // 세션 TTL 값 (초 단위)
    notificationTTL: number; // 세션 만료 알림 TTL 값 (초 단위)
  }
  
  const config: { [key: string]: SessionAndNotificationTTLConfig } = {
    production: {
      sessionTTL: 2 * 60 * 60,  // 배포 환경: 2시간
      notificationTTL: 30 * 60, // 배포 환경: 30분 전 알림
    },
    development: {
      sessionTTL: 5 * 60,       // 로컬 환경: 5분
      notificationTTL: 60,      // 로컬 환경: 1분 전 알림
    },
    test: {
      sessionTTL: 2 * 60 * 60,  // 테스트 환경: 2시간
      notificationTTL: 30 * 60, // 테스트 환경: 30분 전 알림
    },
  };
  
  const environment = process.env.NODE_ENV;
  
  export const sessionAndNotificationTTLConfig = config[environment];