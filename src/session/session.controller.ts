import { Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { SessionService } from './session.service';
import { extractSessionIdFromCookie } from 'src/common/utils';

@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post('monitor')
  async monitorSession(@Req() req: Request, @Res() res: Response): Promise<void> {
    try {
      const cookie = req.headers?.cookie;
      let sessionId;

      console.log('클라이언트의 헤더의 쿠키', cookie);

      if (cookie) {
        // 쿠키에서 sessionId 추출
        sessionId = extractSessionIdFromCookie(cookie);
      }

      if (!sessionId) {
        res.status(400).json({ error: '세션 ID를 찾을 수 없습니다.' });
      }

      console.log('헤더의 쿠키에서 추출한 sessionId', sessionId);

      // 세션 모니터링 시작
      this.sessionService.monitorSession(sessionId);

      res.status(200).json({ message: '세션 모니터링이 시작되었습니다.' });
    } catch (error) {
      res.status(500).json({ error: '세션 모니터링 중 오류가 발생했습니다.' });
    }
  }

  @Post('extend')
  async extendSession(@Req() req: Request, @Res() res: Response): Promise<void> {
    try {
      await this.sessionService.extendSession(req);
      res.status(200).json({ message: '세션이 갱신되었습니다.' });
    } catch (error) {
      res.status(500).json({ error: '세션 갱신 중 오류가 발생했습니다.' });
    }
  }
}
