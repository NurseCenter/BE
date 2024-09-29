import { ApiProperty } from '@nestjs/swagger';

export class BaseErrorResponse {
  @ApiProperty({ description: '에러 메시지' })
  message: string;

  @ApiProperty({ description: '에러 타입' })
  error: string;

  @ApiProperty({ description: 'HTTP 상태 코드' })
  statusCode: number;

  constructor(message: string, error: string, statusCode: number) {
    this.message = message;
    this.error = error;
    this.statusCode = statusCode;
  }
}
