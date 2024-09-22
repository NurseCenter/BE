import { Controller, Get } from '@nestjs/common';
import { HealthCheckService } from './health-check.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Health Check')
@Controller('health')
export class HealthCheckController {
  constructor(private readonly healthService: HealthCheckService) {}

  @ApiOperation({ summary: '서버의 상태 확인' })
  @ApiResponse({
    status: 200,
    description: '서버와 DB 연결 상태를 반환',
    schema: {
      example: {
        status: 'Healthy',
        redis: 'Normally Connected',
        mysql: 'Normally Connected',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 오류 또는 DB 연결 오류',
    schema: {
      example: {
        status: 'Error',
        redis: 'Connection Error Occured',
        mysql: 'Connection Error Occured',
      },
    },
  })
  @Get()
  async checkHealth(): Promise<{ status: string; redis: string; mysql: string; }> {
    const healthStatus = await this.healthService.checkHealth();
    return {
      status: 'Healthy',
      ...healthStatus,
    };
  }

  @ApiOperation({ summary: 'Redis 연결 상태 확인' })
  @ApiResponse({
    status: 200,
    description: 'Redis 연결 상태를 반환',
    schema: {
      example: {
        status: 'Normally Connected',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Redis 연결 오류',
    schema: {
      example: {
        status: 'Connection Error Occured',
      },
    },
  })
  @Get('redis')
  async checkRedis(): Promise<{ status: string }>  {
    const redisStatus = await this.healthService.checkRedis();
    return {
      status: redisStatus ? 'Normally Connected' : 'Connection Error Occured',
    };
  }

  @ApiOperation({ summary: 'MySQL 연결 상태 확인' })
  @ApiResponse({
    status: 200,
    description: 'MySQL 연결 상태를 반환',
    schema: {
      example: {
        status: 'Normally Connected',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'MySQL 연결 오류',
    schema: {
      example: {
        status: 'Connection Error Occured',
      },
    },
  })
  @Get('mysql')
  async checkMySQL(): Promise<{ status: string }> {
    const mysqlStatus = await this.healthService.checkMySQL();
    return {
      status: mysqlStatus ? 'Normally Connected' : 'Connection Error Occured',
    };
  }
}
