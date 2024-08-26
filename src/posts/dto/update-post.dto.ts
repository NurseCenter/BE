import { IsOptional, IsString, Length } from 'class-validator';
import { CreatePostDto } from './create-post.dto';
import { PartialType } from '@nestjs/mapped-types';
import { DeletePostDto } from './delete-post.dto';

export class UpdatePostDto extends DeletePostDto {
  @IsOptional()
  @Length(1, 50)
  @IsString()
  title?: string;

  @IsOptional()
  @Length(1, 2000)
  @IsString()
  content?: string;
}
