import { IsNotEmpty, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { EEmailType } from '../enums';

export class EmailQueryDto {
  @IsNotEmpty()
  @IsEnum(EEmailType)
  emailType: string;

  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsOptional()
  @IsNotEmpty()
  reason?: string;
}
