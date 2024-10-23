import { Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { SessionService } from './session.service';
import { extractSessionIdFromCookie } from 'src/common/utils';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Session')
@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post('monitor')
  @ApiOperation({ summary: '세션 만료 알림 발송을 위한 모니터링 시작 (Request 헤더의 쿠키에서 세션 ID를 추출함)' })
  @ApiResponse({
    status: 200,
    description: '세션 모니터링이 시작되었습니다.',
    schema: { example: { message: '세션 모니터링이 시작되었습니다.' } },
  })
  @ApiResponse({
    status: 400,
    description: '세션 ID를 찾을 수 없습니다.',
    schema: { example: { error: '세션 ID를 찾을 수 없습니다.' } },
  })
  @ApiResponse({
    status: 500,
    description: '세션 모니터링 중 오류가 발생했습니다.',
    schema: { example: { error: '세션 모니터링 중 오류가 발생했습니다.' } },
  })
  @Post('monitor')
  async monitorSession(@Req() req: Request, @Res() res: Response): Promise<any> {
    try {
      const cookie = req.headers?.cookie;
      let sessionId: string;

      if (cookie) {
        // 쿠키에서 sessionId 추출
        sessionId = extractSessionIdFromCookie(cookie);
      }

      if (!sessionId) {
        return res.status(400).json({ error: '세션 ID를 찾을 수 없습니다.' });
      }

      // 세션 모니터링 시작
      this.sessionService.monitorSession(sessionId);

      res.status(200).json({ message: '세션 모니터링이 시작되었습니다.' });
    } catch (error) {
      res.status(500).json({ error: '세션 모니터링 중 오류가 발생했습니다.' });
    }
  }

  @Post('extend')
  @ApiOperation({ summary: '세션 연장 (Request 헤더의 쿠키에서 세션 ID를 추출함)' })
  @ApiResponse({
    status: 200,
    description: '세션이 갱신되었습니다.',
    schema: { example: { message: '세션이 갱신되었습니다.' } },
  })
  @ApiResponse({
    status: 500,
    description: '세션 갱신 중 오류가 발생했습니다.',
    schema: { example: { error: '세션 갱신 중 오류가 발생했습니다.' } },
  })
  async extendSession(@Req() req: Request, @Res() res: Response): Promise<void> {
    try {
      await this.sessionService.extendSession(req, res);
      res.status(200).json({ message: '세션이 갱신되었습니다.' });
    } catch (error) {
      res.status(500).json({ error: '세션 갱신 중 오류가 발생했습니다.' });
    }
  }
}
