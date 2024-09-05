import { IsBoolean, IsNumber } from 'class-validator';

export class ApprovalUserDto {
  @IsNumber()
  userId: number;

  @IsBoolean()
  isApproved: boolean;
}
