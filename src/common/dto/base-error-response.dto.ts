import { ApiProperty } from '@nestjs/swagger';

export class BaseErrorResponse {
  @ApiProperty()
  message: string;

  @ApiProperty()
  error: string;

  @ApiProperty()
  statusCode: number;

  constructor(message: string, error: string, statusCode: number) {
    this.message = message;
    this.error = error;
    this.statusCode = statusCode;
  }
}