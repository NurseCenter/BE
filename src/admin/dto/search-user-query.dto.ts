import { IsEnum, IsString, IsOptional } from 'class-validator';
import { ESearchUser } from '../enums';

export class SearchUserQueryDto {
  @IsEnum(ESearchUser)
  @IsOptional()
  type?: ESearchUser;

  @IsString()
  @IsOptional()
  search?: string;
}
