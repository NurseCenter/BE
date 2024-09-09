import { IsNumber, IsString } from 'class-validator';

export class UpdateUserCertificationDto {
  @IsNumber()
  userId: number;

  @IsString()
  imageUrl: string;
}
