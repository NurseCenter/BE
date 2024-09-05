import { IsString, IsNotEmpty } from 'class-validator';

export class DeletionUserDto {
  @IsNotEmpty()
  readonly userId: number;

  @IsString()
  @IsNotEmpty()
  readonly deletionReason: string;
}
