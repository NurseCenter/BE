import { IsBoolean, IsNumber } from 'class-validator';

export class ApprovalDto {
  @IsNumber()
  userId: number;

  @IsBoolean()
  isApproved: boolean;
}
