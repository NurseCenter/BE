import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Hello 메시지 가져오기' })
  @ApiResponse({
    status: 200,
    description: '"Hello" 메시지와 현재 날짜 및 시간을 반환',
  })
  @ApiResponse({
    status: 500,
    description: '내부 서버 오류',
  })
  @Get()
  getHello(): { message: string } {
    return this.appService.getHello();
  }
}
